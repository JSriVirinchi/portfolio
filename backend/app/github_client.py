from __future__ import annotations

from datetime import datetime
from typing import List, Optional

import httpx
from fastapi import HTTPException

from .config import get_settings
from .schemas import GithubRepo

GITHUB_API_BASE = "https://api.github.com"


async def fetch_repositories(query: Optional[str] = None) -> List[GithubRepo]:
    settings = get_settings()
    username = settings.github_username
    if not username:
        raise HTTPException(status_code=500, detail="GitHub username is not configured")

    params = {"sort": "updated", "per_page": 100}
    headers = {"Accept": "application/vnd.github+json"}

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(f"{GITHUB_API_BASE}/users/{username}/repos", params=params, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail="Unable to fetch repositories from GitHub")

    raw_repos = response.json()
    lower_query = query.lower() if query else None

    filtered = []
    for repo in raw_repos:
        topics = repo.get("topics") or []
        include = True
        if lower_query:
            haystack = " ".join([
                repo.get("name") or "",
                repo.get("description") or "",
                " ".join(topics),
            ]).lower()
            include = lower_query in haystack
        if include:
            filtered.append(
                GithubRepo(
                    name=repo.get("name"),
                    description=repo.get("description"),
                    html_url=repo.get("html_url"),
                    homepage=repo.get("homepage"),
                    stargazers_count=repo.get("stargazers_count", 0),
                    language=repo.get("language"),
                    topics=topics,
                    updated_at=_parse_datetime(repo.get("updated_at")),
                )
            )
    return filtered


def _parse_datetime(value: Optional[str]) -> datetime:
    if not value:
        return datetime.utcnow()
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)
