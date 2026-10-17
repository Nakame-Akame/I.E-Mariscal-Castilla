import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface RequestBody {
  user_id?: string
  code?: string
}

async function hashCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function obtenerIdSesion(authHeader: string | null): string | null {
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]
  const payload = token?.split(".")[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const claims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")))
    return typeof claims.session_id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claims.session_id)
      ? claims.session_id
      : null
  } catch {
    return null
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return response({ error: "Método no permitido" }, 405)

  try {
    const authHeader = req.headers.get("Authorization")
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    })
    const { data: authData } = await userClient.auth.getUser()
    const body: RequestBody = await req.json()
    // La función verifica la identidad antes de consultar el OTP con privilegios de servicio.
    if (!authData.user || !body.user_id || authData.user.id !== body.user_id || !/^\d{6}$/.test(body.code ?? "")) {
      return response({ error: "Código inválido" }, 400)
    }
    const sessionId = obtenerIdSesion(authHeader)
    if (!sessionId) return response({ error: "No se pudo validar la sesión" }, 401)

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: otp, error: readError } = await adminClient
      .from("otp_codes")
      .select("id, code_hash, expires_at, attempts, used")
      .eq("user_id", body.user_id)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (readError || !otp) return response({ error: "El código no existe o ha expirado" }, 400)
    if (otp.used || new Date(otp.expires_at).getTime() <= Date.now()) {
      return response({ error: "El código ha expirado. Solicita uno nuevo" }, 400)
    }

    // Cada intento incorrecto consume el contador y el quinto invalida el código.
    const attempts = Number(otp.attempts ?? 0)
    const matches = (await hashCode(body.code ?? "")) === otp.code_hash
    if (!matches) {
      const nextAttempts = attempts + 1
      await adminClient.from("otp_codes").update({ attempts: nextAttempts, used: nextAttempts >= 5 }).eq("id", otp.id)
      return response({ error: nextAttempts >= 5 ? "Superaste los intentos. Solicita un nuevo código" : "Código incorrecto" }, 400)
    }

    const { error: updateError } = await adminClient.from("otp_codes").update({ used: true }).eq("id", otp.id).eq("used", false)
    if (updateError) return response({ error: "No se pudo confirmar el código" }, 500)

    const { error: approvalError } = await adminClient
      .from("otp_verified_sessions")
      .upsert(
        {
          user_id: authData.user.id,
          session_id: sessionId,
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "user_id,session_id" },
      )
    if (approvalError) {
      console.error("No se pudo registrar la verificación OTP:", approvalError)
      return response({ error: "No se pudo confirmar la verificación" }, 500)
    }
    return response({ success: true })
  } catch (error) {
    console.error("Error en verify-otp:", error)
    return response({ error: "Error interno del servidor" }, 500)
  }
})
