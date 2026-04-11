"""GET /admin/stats — aggregate metrics for the admin dashboard."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from sqlalchemy import func, select

from ..db.models import ConversationTurn, Session as SessionModel
from ..db.session import SessionLocal

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def stats() -> dict[str, Any]:
    db = SessionLocal()
    try:
        total_sessions = db.scalar(select(func.count()).select_from(SessionModel)) or 0
        total_turns = db.scalar(select(func.count()).select_from(ConversationTurn)) or 0

        level_counts = {"GREEN": 0, "YELLOW": 0, "RED": 0}
        for (rr,) in db.execute(select(SessionModel.risk_result)).all():
            if rr and isinstance(rr, dict):
                lvl = rr.get("level")
                if lvl in level_counts:
                    level_counts[lvl] += 1

        return {
            "total_sessions": total_sessions,
            "total_turns": total_turns,
            "triage_distribution": level_counts,
        }
    finally:
        db.close()
