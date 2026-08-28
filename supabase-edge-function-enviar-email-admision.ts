import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://cdn.jsdelivr.net/npm/resend@latest/dist/index.d.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface RequestBody {
  nombre: string;
  correo: string;
}

serve(async (req: Request) => {
  // Permitir solo POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { nombre, correo }: RequestBody = await req.json();

    // Validar datos
    if (!nombre || !correo) {
      return new Response(
        JSON.stringify({ error: "Nombre y correo son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Enviar email usando Resend
    const result = await resend.emails.send({
      from: "admin@mariscalcastilla.edu.pe", // Cambia a tu dominio
      to: correo,
      subject: "✓ Acceso Admitido - Portal Estudiantes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b1a2b 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">¡Bienvenido!</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">
              Hola <strong>${nombre}</strong>,
            </p>

            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Nos complace informarte que tu solicitud de acceso al Portal Estudiantes ha sido <strong style="color: #c41e3a;">APROBADA</strong>.
            </p>

            <div style="background: #e8f4f8; border-left: 4px solid #c41e3a; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                Ahora puedes acceder al portal con tu correo institucional (<strong>${correo}</strong>) y la contraseña asignada por la institución.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://portal.mariscalcastilla.edu.pe" style="background: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                Ir al Portal
              </a>
            </div>

            <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
              Si tienes dudas, comunícate con Secretaría.<br>
              <strong>Institución Educativa Mariscal Castilla</strong>
            </p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("Error al enviar email:", result.error);
      return new Response(
        JSON.stringify({ error: "No se pudo enviar el email" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en la función:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
