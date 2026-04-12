"""SQLAlchemy engine + session factory (lazily initialized).

We build the engine on first use rather than at import time so unit tests and
local smoke runs can import the rest of the agent without needing a live
Postgres driver installed.
"""
from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from . import settings
from ..models import Base

_engine: Any = None
_SessionLocal: sessionmaker | None = None


def _get_engine():
    global _engine
    if _engine is None:
        from sqlalchemy import create_engine
        _engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
    return _engine


def _get_session_factory() -> sessionmaker:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            bind=_get_engine(), autoflush=False, autocommit=False, future=True
        )
    return _SessionLocal


class _LazySessionLocal:
    """Callable shim so ``SessionLocal()`` resolves the factory on demand."""

    def __call__(self) -> Session:
        return _get_session_factory()()


SessionLocal = _LazySessionLocal()


def init_db() -> None:
    """Create tables if they don't exist. Idempotent — safe at startup."""
    Base.metadata.create_all(bind=_get_engine())


def get_db() -> Session:
    """FastAPI dependency: yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
