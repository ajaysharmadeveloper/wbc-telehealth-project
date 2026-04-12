"""GET /session/{id} — return stored conversation history + patient data."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from ..models import Session as SessionModel
from ..config.session import SessionLocal

router = APIRouter(prefix="/session", tags=["session"])


@router.get("/{session_id}")
def get_session(session_id: str) -> dict[str, Any]:
    db = SessionLocal()
    try:
        sess = db.get(SessionModel, session_id)
        if sess is None:
            raise HTTPException(status_code=404, detail="session not found")
        return {
            "session_id": sess.id,
            "user_id": sess.user_id,
            "patient_data": sess.patient_data,
            "risk_result": sess.risk_result,
            "turn_count": sess.turn_count,
            "turns": [
                {
                    "role": t.role,
                    "content": t.content,
                    "tool_name": t.tool_name,
                    "created_at": t.created_at.isoformat(),
                }
                for t in sorted(sess.turns, key=lambda t: t.id)
            ],
        }
    finally:
        db.close()
