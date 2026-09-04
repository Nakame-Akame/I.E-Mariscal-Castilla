import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@mariscalcastilla.edu.pe"
const PORTAL_LOGO_URL = Deno.env.get("PORTAL_LOGO_URL") || "https://raw.githubusercontent.com/Nakame-Akame/I.E-Mariscal-Castilla/main/img/mc.png"
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
        from: RESEND_FROM_EMAIL,
        to: authData.user.email,
        subject: "Tu código de verificación | Portal estudiantil",
        html: `
          <div style="margin:0;padding:32px 16px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#17233b;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e1e5eb;border-radius:8px;overflow:hidden;">
              <div style="height:5px;background:linear-gradient(90deg,#a90016 0%,#d2ad45 50%,#0b2445 100%);"></div>
              <div style="padding:32px 36px 8px;text-align:center;">
                <img src="${PORTAL_LOGO_URL}" width="72" height="72" alt="IEP Mariscal Castilla" style="display:block;width:72px;height:72px;object-fit:contain;margin:0 auto 18px;">
                <p style="margin:0;color:#a90016;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Portal estudiantil</p>
                <h1 style="margin:8px 0 0;color:#17233b;font-size:25px;line-height:1.25;">Verificación de acceso</h1>
              </div>
              <div style="padding:20px 36px 32px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">Usa el siguiente código para confirmar tu identidad y acceder al portal:</p>
                <div style="margin:24px 0;padding:20px 12px;background:#f8f9fb;border:1px solid #e1e5eb;border-radius:6px;text-align:center;">
                  <span style="color:#17233b;font-size:34px;font-weight:bold;letter-spacing:9px;line-height:1;">${code}</span>
                </div>
                <p style="margin:0;text-align:center;color:#5d6878;font-size:13px;line-height:1.5;">Este código vence en <strong style="color:#17233b;">10 minutos</strong> y solo puede utilizarse una vez.</p>
                <div style="margin:28px 0 0;padding:14px 16px;border-left:3px solid #d2ad45;background:#fffaf0;color:#5d6878;font-size:12px;line-height:1.55;">
                  Si no solicitaste este código, puedes ignorar este mensaje. Tu cuenta permanece protegida.
                </div>
              </div>
              <div style="padding:20px 36px;background:#f8f9fb;border-top:1px solid #e8ebf0;text-align:center;">
                <p style="margin:0;color:#5d6878;font-size:12px;line-height:1.5;">IEP Mariscal Castilla<br>Huancayo, Junín</p>
              </div>
            </div>
          </div>
        `,
      }),
    })
    if (!emailResponse.ok) {
      const resendError = await emailResponse.json().catch(() => null)
      const detalle = resendError?.message || resendError?.name || "Resend rechazó el envío"
      console.error("Error enviando OTP:", resendError || detalle)
      const mensaje = String(detalle).toLowerCase()
      if (mensaje.includes("only send testing emails") || mensaje.includes("testing emails")) {
        return response({
          error: "Resend solo permite enviar al correo de prueba. Verifica el dominio mariscalcastilla.edu.pe y configura RESEND_FROM_EMAIL con un remitente de ese dominio.",
        }, 502)
      }
      return response({ error: detalle }, 502)
    }
    return response({ success: true })
  } catch (error) {
    console.error("Error en send-otp:", error)
    return response({ error: "Error interno del servidor" }, 500)
  }
})
