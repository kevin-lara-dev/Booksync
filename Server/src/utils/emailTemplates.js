// texto del email para restablecer la contraseña

const resetPasswordTemplate = (nombre, resetLink) => `
  <div style="background:#1a1008;padding:40px 0;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#f7eacc;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);">

      <!-- header -->
      <div style="background:#31111d;padding:28px 32px;text-align:center;">
        <h1 style="margin:0;color:#f3e6c5;font-size:26px;letter-spacing:2px;font-family:Georgia,serif;">BOOKSYNC</h1>
        <p style="margin:6px 0 0;color:#c9a96e;font-size:13px;letter-spacing:1px;">Sistema de Gestión de Biblioteca</p>
      </div>

      <!-- body -->
      <div style="padding:36px 32px;">
        <p style="color:#2c2a26;font-size:16px;margin:0 0 12px;">Hola, <strong>${nombre}</strong></p>
        <p style="color:#4a3b28;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          Haz clic en el botón para crear una nueva contraseña.
        </p>

        <!-- boton -->
        <div style="text-align:center;margin:0 0 28px;">
          <a href="${resetLink}"
             style="display:inline-block;background:#31111d;color:#f3e6c5;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-family:Georgia,serif;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            Restablecer contraseña
          </a>
        </div>

        <!-- aviso expiracion -->
        <div style="background:#e7d2a4;border-left:4px solid #c9a96e;border-radius:4px;padding:12px 16px;margin:0 0 24px;">
          <p style="margin:0;color:#4a3b28;font-size:13px;">
            Este enlace vence en <strong>1 hora</strong>. Si no lo usas, deberás solicitar uno nuevo.
          </p>
        </div>

        <p style="color:#7a6a55;font-size:13px;margin:0;">
          Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará.
        </p>
      </div>

      <!-- footer -->
      <div style="background:#2c1810;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#9a7a55;font-size:12px;">BookSync &copy; 2025 — Sistema de Gestión de Biblioteca</p>
      </div>

    </div>
  </div>
`;

module.exports = { resetPasswordTemplate };
