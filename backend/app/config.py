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
    github_username: str = os.getenv("GITHUB_USERNAME", "JSriVirinchi")

    email_smtp_host: Optional[str] = os.getenv("EMAIL_SMTP_HOST")
    email_smtp_port: int = int(os.getenv("EMAIL_SMTP_PORT", "587"))
    email_smtp_username: Optional[str] = os.getenv("EMAIL_SMTP_USERNAME")
    email_smtp_password: Optional[str] = os.getenv("EMAIL_SMTP_PASSWORD")
    email_from: EmailStr = Field(default=os.getenv("EMAIL_FROM") or "portfolio@localhost")
    email_to: EmailStr = Field(default=os.getenv("EMAIL_FORWARD_TO") or "virinchi.junuthula@gmail.com")
    email_use_tls: bool = os.getenv("EMAIL_USE_TLS", "true").lower() != "false"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
