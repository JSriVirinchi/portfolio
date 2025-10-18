from __future__ import annotations

import json
from pathlib import Path

from .config import get_settings
from .schemas import Profile


def load_profile() -> Profile:
    settings = get_settings()
    path: Path = settings.profile_path
    return _load_profile_cached(path.resolve())


def _load_profile_cached(path: Path) -> Profile:
    mtime = path.stat().st_mtime_ns
    cache_key = (str(path), mtime)
    return _cached_profile(cache_key, path)


def _cached_profile(cache_key: tuple[str, int], path: Path) -> Profile:
    if cache_key != _cached_profile.last_key:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        _cached_profile.last_value = Profile.model_validate(data)
        _cached_profile.last_key = cache_key
    return _cached_profile.last_value


_cached_profile.last_key = None  # type: ignore[attr-defined]
_cached_profile.last_value = None  # type: ignore[attr-defined]
