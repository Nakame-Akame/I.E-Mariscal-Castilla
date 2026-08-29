import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface RequestBody {
  user_id?: string
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return response({ error: "Método no permitido" }, 405)

  try {
    if (!RESEND_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return response({ error: "La función no está configurada" }, 500)
    }

    const authHeader = req.headers.get("Authorization")
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    })
    const { data: authData } = await userClient.auth.getUser()
    const body: RequestBody = await req.json()
    // El usuario autenticado solo puede solicitar un código para sí mismo.
    if (!authData.user || !body.user_id || authData.user.id !== body.user_id) {
      return response({ error: "No autorizado" }, 401)
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    // El código plano solo existe durante esta ejecución y nunca se guarda en la base de datos.
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const codeHash = await hashCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await adminClient.from("otp_codes").update({ used: true }).eq("user_id", body.user_id).eq("used", false)
    const { error: insertError } = await adminClient.from("otp_codes").insert({
      user_id: body.user_id,
      code_hash: codeHash,
      expires_at: expiresAt,
    })
    if (insertError) return response({ error: "No se pudo generar el código" }, 500)

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "admin@mariscalcastilla.edu.pe",
        to: authData.user.email,
        subject: "Código de verificación - Portal Estudiantes",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1 style="color:#c41e3a">Verificación de acceso</h1><p>Tu código de verificación es:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center">${code}</p><p>Caduca en 10 minutos y solo puede usarse una vez.</p><p>Si no solicitaste este acceso, ignora este mensaje.</p></div>`,
      }),
    })
    if (!emailResponse.ok) {
      console.error("Error enviando OTP:", await emailResponse.text())
      return response({ error: "No se pudo enviar el código" }, 500)
    }
    return response({ success: true })
  } catch (error) {
    console.error("Error en send-otp:", error)
    return response({ error: "Error interno del servidor" }, 500)
  }
})
