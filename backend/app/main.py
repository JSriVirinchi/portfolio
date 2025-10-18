from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse, Response

from .config import ROOT_DIR, Settings, get_settings
from .github_client import fetch_repositories
from .mailer import dispatch_contact_email
from .profile_loader import load_profile
from .schemas import (
    ContactRequest,
    ContactResponse,
    GithubReposResponse,
    Profile,
)

app = FastAPI(
    title="Virinchi Portfolio API",
    version="1.0.0",
    description="Backend services for Satya Sri Virinchi Junuthula's interactive portfolio.",
)


@app.on_event("startup")
async def preload_profile() -> None:
    # Prime cache so the first visitor doesn't incur disk read latency.
    load_profile()


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/profile", response_model=Profile, tags=["profile"])
def get_profile() -> Profile:
    return load_profile()


@app.get("/api/github/repos", response_model=GithubReposResponse, tags=["github"])
async def get_github_repositories(
    q: Optional[str] = Query(None, description="Optional search term to filter repositories"),
) -> GithubReposResponse:
    results = await fetch_repositories(q)
    return GithubReposResponse(query=q, results=results)


@app.post("/api/contact", response_model=ContactResponse, tags=["contact"])
async def send_contact_message(payload: ContactRequest) -> ContactResponse:
    await dispatch_contact_email(payload)
    return ContactResponse(status="received", timestamp=datetime.utcnow())


@app.get("/resume", tags=["profile"])
def download_resume(settings: Settings = Depends(get_settings)) -> Response:
    profile = load_profile()
    if not profile.resume:
        raise HTTPException(status_code=404, detail="Resume not configured")

    resume_ref = profile.resume.strip()
    if resume_ref.startswith(("http://", "https://")):
        return RedirectResponse(resume_ref)

    resume_path = (ROOT_DIR.parent / resume_ref).resolve()
    project_root = ROOT_DIR.parent.resolve()
    if not str(resume_path).startswith(str(project_root)):
        raise HTTPException(status_code=400, detail="Invalid resume path")

    if not resume_path.exists():
        raise HTTPException(status_code=404, detail="Resume file not found")

    return FileResponse(resume_path, filename=resume_path.name, media_type="application/pdf")


settings = get_settings()
allowed_origins = {settings.frontend_origin}
if "localhost" in settings.frontend_origin:
    allowed_origins.add(settings.frontend_origin.replace("localhost", "127.0.0.1"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)
