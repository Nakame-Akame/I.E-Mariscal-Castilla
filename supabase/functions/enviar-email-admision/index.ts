import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@mariscalcastilla.edu.pe"

interface RequestBody {
  nombre?: string
  correo?: string
}

serve(async (req: Request) => {
  // Permitir CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    // Parsear request
    const body: RequestBody = await req.json()
    const { nombre, correo } = body

    if (!nombre || !correo) {
      return new Response(
        JSON.stringify({ error: "nombre y correo son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY no configurado" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Enviar email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: correo,
        subject: "✓ Solicitud de Acceso Recibida - Portal Estudiantes",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">Solicitud Recibida</h1>
              </div>
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Estimado/a <strong>${nombre}</strong>,</p>
                <p>Tu solicitud de acceso al <strong>Portal Estudiantes de Mariscal Castilla</strong> ha sido recibida correctamente.</p>
                <p>Nuestro equipo de administración la revisará pronto. Te enviaremos un correo de confirmación cuando tu acceso sea aprobado.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                  Si tienes dudas, contacta a: <strong>secretaria@mariscalcastilla.edu.pe</strong>
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error("Error enviando email:", emailResult)
      return new Response(
        JSON.stringify({ error: "Error al enviar email", details: emailResult }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado", id: emailResult.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Error interno", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
