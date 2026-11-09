import html
import os
from pathlib import Path

import resend
from dotenv import load_dotenv

from auth.security import RESET_TOKEN_EXPIRE_MINUTES


load_dotenv(Path(__file__).resolve().parent.parent / ".env")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Brasaland <onboarding@resend.dev>")


def send_password_reset_email(to_email: str, token: str) -> None:
    """Envía el correo con el enlace para restablecer la contraseña."""
    if not RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY debe estar definida en services/api/.env.")

    link = f"{FRONTEND_URL}/reset-password?token={token}"
    safe_link = html.escape(link, quote=True)

    html_body = f"""<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:16px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 16px;">Restablece tu contraseña</h1>
      <p style="font-size:16px;line-height:1.5;margin:0 0 24px;">Recibimos una solicitud para cambiar la contraseña de tu cuenta de Brasaland.</p>
      <a href="{safe_link}" style="display:block;text-align:center;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;font-size:16px;">Restablecer contraseña</a>
      <p style="font-size:14px;line-height:1.5;margin:24px 0 8px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="font-size:14px;line-height:1.5;word-break:break-all;margin:0 0 24px;"><a href="{safe_link}" style="color:#2563eb;">{safe_link}</a></p>
      <p style="font-size:14px;line-height:1.5;color:#6b7280;margin:0;">Este enlace vence en {RESET_TOKEN_EXPIRE_MINUTES} minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  </body>
</html>"""

    text_body = (
        "Restablece tu contraseña de Brasaland\n\n"
        "Recibimos una solicitud para cambiar la contraseña de tu cuenta.\n"
        f"Abre este enlace para crear una nueva contraseña:\n{link}\n\n"
        f"Este enlace vence en {RESET_TOKEN_EXPIRE_MINUTES} minutos. "
        "Si no solicitaste este cambio, puedes ignorar este correo.\n"
    )

    resend.api_key = RESEND_API_KEY
    resend.Emails.send(
        {
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": "Restablece tu contraseña de Brasaland",
            "html": html_body,
            "text": text_body,
        }
    )
