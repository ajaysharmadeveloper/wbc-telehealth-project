"""Thin Redis wrapper for fast session lookups.

Postgres remains the source of truth; Redis is used to avoid a DB round-trip
when loading the current turn's session context.
"""
from __future__ import annotations

import json
from typing import Any

try:
    import redis  # type: ignore
except ImportError:  # pragma: no cover
    redis = None

from ..config import settings


class SessionCache:
    def __init__(self, url: str | None = None) -> None:
        self._url = url or settings.redis_url
        self._client = None
        if redis is not None:
            try:
                self._client = redis.Redis.from_url(self._url, decode_responses=True)
                self._client.ping()
            except Exception:
                self._client = None

    @property
    def available(self) -> bool:
        return self._client is not None

    def get(self, session_id: str) -> dict[str, Any] | None:
        if not self._client:
            return None
        raw = self._client.get(f"session:{session_id}")
        return json.loads(raw) if raw else None

    def set(self, session_id: str, payload: dict[str, Any], ttl: int = 3600) -> None:
        if not self._client:
            return
        self._client.setex(f"session:{session_id}", ttl, json.dumps(payload))


session_cache = SessionCache()
