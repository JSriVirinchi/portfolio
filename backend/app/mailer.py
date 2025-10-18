from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
import smtplib

from fastapi import HTTPException

from .config import ROOT_DIR, get_settings
from .schemas import ContactRequest


async def dispatch_contact_email(payload: ContactRequest) -> None:
    settings = get_settings()

    if not settings.email_smtp_host:
        _store_locally(payload)
        return

    msg = EmailMessage()
    msg["Subject"] = f"Portfolio message from {payload.name}"
    msg["From"] = settings.email_from
    msg["To"] = settings.email_to
    msg["Reply-To"] = payload.email
    msg.set_content(_format_body(payload))

    await asyncio.to_thread(
        _send_smtp,
        settings.email_smtp_host,
        settings.email_smtp_port,
        settings.email_smtp_username,
        settings.email_smtp_password,
        settings.email_use_tls,
        msg,
    )


def _send_smtp(host: str, port: int, username: str | None, password: str | None, use_tls: bool, msg: EmailMessage) -> None:
    try:
        if use_tls:
            server = smtplib.SMTP(host, port)
            server.starttls()
        else:
            server = smtplib.SMTP(host, port)
        if username and password:
            server.login(username, password)
        server.send_message(msg)
    except smtplib.SMTPException as exc:
        raise HTTPException(status_code=502, detail=f"Unable to send email: {exc}") from exc
    finally:
        try:
            server.quit()
        except Exception:
            pass


def _format_body(payload: ContactRequest) -> str:
    return (
        f"Message submitted on {datetime.now(timezone.utc).isoformat()}\n\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n\n"
        f"Message:\n{payload.message}\n"
    )


def _store_locally(payload: ContactRequest) -> None:
    storage = ROOT_DIR / "app" / "data" / "messages.log"
    storage.parent.mkdir(parents=True, exist_ok=True)
    with storage.open("a", encoding="utf-8") as handle:
        handle.write(
            "\n".join(
                [
                    "=" * 60,
                    datetime.now(timezone.utc).isoformat(),
                    f"From: {payload.name} <{payload.email}>",
                    payload.message,
                    "",
                ]
            )
        )
