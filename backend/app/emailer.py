from __future__ import annotations

from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr
import smtplib

from backend.app.config import Settings


@dataclass(slots=True)
class EmailDeliveryResult:
    status: str
    error: str | None = None


def smtp_is_configured(settings: Settings) -> bool:
    return all(
        [
            settings.smtp_sender_email,
            settings.smtp_username,
            settings.smtp_password is not None,
        ]
    )


def send_email(
    *,
    settings: Settings,
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str | None = None,
    reply_to: str | None = None,
) -> EmailDeliveryResult:
    if not smtp_is_configured(settings):
        return EmailDeliveryResult(status="pending_config")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((settings.smtp_sender_name, settings.smtp_sender_email or ""))
    message["To"] = to_email
    if reply_to or settings.smtp_reply_to:
        message["Reply-To"] = reply_to or settings.smtp_reply_to or ""

    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    password = settings.smtp_password.get_secret_value() if settings.smtp_password else ""

    try:
        if settings.smtp_use_ssl:
            server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds)
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds)

        with server:
            server.ehlo()
            if settings.smtp_use_starttls:
                server.starttls()
                server.ehlo()
            server.login(settings.smtp_username or "", password)
            server.send_message(message)
        return EmailDeliveryResult(status="sent")
    except Exception as exc:  # pragma: no cover - exercised by integration path
        return EmailDeliveryResult(status="failed", error=str(exc))
