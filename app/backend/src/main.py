"""FastAPI entrypoint for the Telehealth Triage backend."""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import admin as admin_api
from .api import chat as chat_api
from .api import session as session_api
from .config import settings

logging.basicConfig(level=settings.log_level)
log = logging.getLogger("triage.main")


app = FastAPI(
    title="Telehealth Triage AI",
    description="LangGraph ReAct triage agent for diabetes pre-screening.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Run alembic migrations at startup.

    In development we fall back to ``Base.metadata.create_all`` so the first
    local run works without a separate ``alembic upgrade head`` step. In any
    other environment, migrations are the source of truth.
    """
    try:
        from alembic import command
        from alembic.config import Config as AlembicConfig
        from pathlib import Path

        ini_path = Path(__file__).resolve().parents[1] / "alembic.ini"
        cfg = AlembicConfig(str(ini_path))
        cfg.set_main_option("sqlalchemy.url", settings.database_url)
        command.upgrade(cfg, "head")
        log.info("Alembic migrations applied (head).")
    except Exception as exc:
        log.warning("Alembic upgrade failed (%s).", exc)
        if settings.app_env == "development":
            try:
                from .config.session import init_db
                init_db()
                log.info("Dev fallback: Base.metadata.create_all() ran.")
            except Exception as exc2:
                log.warning("init_db fallback also failed (%s).", exc2)


@app.get("/health")
def health() -> dict[str, str]:
    from .telegram.bot import _application
    tg_status = "disabled"
    if settings.telegram_enabled:
        tg_status = "running" if _application is not None else "failed"
    return {"status": "ok", "env": settings.app_env, "telegram": tg_status}


app.include_router(chat_api.router)
app.include_router(session_api.router)
app.include_router(admin_api.router)


@app.on_event("startup")
def start_telegram_bot() -> None:
    """Launch Telegram bot polling in a background thread if enabled."""
    try:
        from .telegram.bot import start_bot
        start_bot()
    except Exception as exc:
        log.warning("Telegram bot startup failed (%s).", exc)


@app.on_event("shutdown")
def stop_telegram_bot() -> None:
    """Gracefully stop the Telegram bot."""
    try:
        from .telegram.bot import stop_bot
        stop_bot()
    except Exception as exc:
        log.warning("Telegram bot shutdown failed (%s).", exc)

