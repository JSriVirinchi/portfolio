from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException
import httpx

from .config import ROOT_DIR, get_settings
from .schemas import ContactRequest


async def dispatch_contact_email(payload: ContactRequest) -> None:
    settings = get_settings()

    if not settings.sendgrid_api_key:
        _store_locally(payload)
        return

    await _send_via_sendgrid(settings.sendgrid_api_key, settings.email_from, settings.email_to, payload)


async def _send_via_sendgrid(api_key: str, sender: str, recipient: str, payload: ContactRequest) -> None:
    body = {
        "personalizations": [
            {
                "to": [{"email": recipient}],
                "subject": "Virinchi's Portfolio website.",
            }
        ],
        "from": {"email": sender, "name": payload.name},
        "reply_to": {"email": payload.email},
        "content": [
            {"type": "text/plain", "value": _format_body(payload)},
        ],
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=body,
        )

    if response.status_code >= 400:
        detail = response.text or "SendGrid API error"
        raise HTTPException(status_code=502, detail=detail)


def _format_body(payload: ContactRequest) -> str:
    return (
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
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
                    "Subject: Virinchi's Portfolio website.",
                    _format_body(payload),
                    "",
                ]
            )
        )
