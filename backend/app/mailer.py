from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException
import httpx
from starlette.concurrency import run_in_threadpool

from .config import ROOT_DIR, get_settings
from .schemas import ContactRequest

SUBJECT = "Virinchi's Portfolio website."


async def dispatch_contact_email(payload: ContactRequest) -> None:
    settings = get_settings()

    # Preferred (all-AWS) path: Amazon SES.
    if settings.use_ses:
        await run_in_threadpool(
            _send_via_ses,
            settings.ses_region,
            str(settings.email_from),
            str(settings.email_to),
            payload,
        )
        return

    # Fallback: SendGrid HTTP API (kept for non-AWS hosting).
    if settings.sendgrid_api_key:
        await _send_via_sendgrid(
            settings.sendgrid_api_key,
            str(settings.email_from),
            str(settings.email_to),
            payload,
        )
        return

    # Last resort: persist locally so nothing is lost during local testing.
    _store_locally(payload)


def _send_via_ses(region: str | None, sender: str, recipient: str, payload: ContactRequest) -> None:
    # boto3 is provided by the Lambda Python runtime; imported lazily so the
    # other delivery paths don't require it to be installed.
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

    client = boto3.client("sesv2", region_name=region)
    try:
        client.send_email(
            FromEmailAddress=sender,
            ReplyToAddresses=[payload.email],
            Destination={"ToAddresses": [recipient]},
            Content={
                "Simple": {
                    "Subject": {"Data": SUBJECT},
                    "Body": {"Text": {"Data": _format_body(payload)}},
                }
            },
        )
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - network/IAM errors
        raise HTTPException(status_code=502, detail=f"SES send failed: {exc}") from exc


async def _send_via_sendgrid(api_key: str, sender: str, recipient: str, payload: ContactRequest) -> None:
    body = {
        "personalizations": [
            {
                "to": [{"email": recipient}],
                "subject": SUBJECT,
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


def _log_dir() -> Path:
    # Lambda's filesystem is read-only except for /tmp, so never write into the
    # bundled package there. Honour an explicit override otherwise.
    override = os.getenv("MESSAGE_LOG_DIR")
    if override:
        return Path(override)
    if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return Path("/tmp")
    return ROOT_DIR / "app" / "data"


def _store_locally(payload: ContactRequest) -> None:
    storage = _log_dir() / "messages.log"
    storage.parent.mkdir(parents=True, exist_ok=True)
    with storage.open("a", encoding="utf-8") as handle:
        handle.write(
            "\n".join(
                [
                    "=" * 60,
                    datetime.now(timezone.utc).isoformat(),
                    f"Subject: {SUBJECT}",
                    _format_body(payload),
                    "",
                ]
            )
        )
