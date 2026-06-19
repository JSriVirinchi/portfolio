from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")


class Settings(BaseModel):
    profile_path: Path = ROOT_DIR / "app" / "data" / "profile.json"
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    github_username: str = os.getenv("GITHUB_USERNAME", "JsriVirinchi")

    # Contact-form email delivery.
    # EMAIL_PROVIDER: "ses" | "sendgrid" | "log" | "auto" (default).
    # On Lambda, AWS_REGION is always set, so "auto" resolves to SES.
    email_provider: str = (os.getenv("EMAIL_PROVIDER") or "auto").lower()
    ses_region: Optional[str] = os.getenv("SES_REGION") or os.getenv("AWS_REGION")
    sendgrid_api_key: Optional[str] = os.getenv("SENDGRID_API_KEY")
    email_from: EmailStr = Field(default=os.getenv("EMAIL_FROM") or "portfolio@example.com")
    email_to: EmailStr = Field(default=os.getenv("EMAIL_FORWARD_TO") or "virinchi.junuthula@gmail.com")

    @property
    def use_ses(self) -> bool:
        if self.email_provider == "ses":
            return True
        if self.email_provider in {"sendgrid", "log"}:
            return False
        # auto: prefer SES whenever a region is available and SendGrid isn't configured.
        return bool(self.ses_region) and not self.sendgrid_api_key


@lru_cache()
def get_settings() -> Settings:
    return Settings()
