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

    sendgrid_api_key: Optional[str] = os.getenv("SENDGRID_API_KEY")
    email_from: EmailStr = Field(default=os.getenv("EMAIL_FROM") or "portfolio@localhost")
    email_to: EmailStr = Field(default=os.getenv("EMAIL_FORWARD_TO") or "virinchi.junuthula@gmail.com")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
