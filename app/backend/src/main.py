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
    try:
        from .db.session import init_db
        init_db()
        log.info("Database tables ensured.")
    except Exception as exc:
        log.warning("init_db failed (%s) — running without DB.", exc)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}


app.include_router(chat_api.router)
app.include_router(session_api.router)
app.include_router(admin_api.router)
