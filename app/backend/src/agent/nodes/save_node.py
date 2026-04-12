"""Save Node — persists the turn to Postgres + refreshes the Redis cache.

Designed to be resilient: if the DB is unreachable we log and continue so
local/dev smoke runs still complete.
"""
from __future__ import annotations

import logging

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from ...models import ConversationTurn, Session as SessionModel
from ...config.session import SessionLocal
from ...services.session_cache import session_cache
from ..state import AgentState

log = logging.getLogger(__name__)


def _role_of(msg) -> str:
    if isinstance(msg, HumanMessage):
        return "user"
    if isinstance(msg, AIMessage):
        return "assistant"
    if isinstance(msg, ToolMessage):
        return "tool"
    return "system"


def save_node(state: AgentState) -> dict:
    session_id = state.get("session_id")
    if not session_id:
        return {}

    messages = state.get("messages", [])
    patient_data = state.get("patient_data", {}) or {}
    risk_result = state.get("risk_result")

    try:
        db = SessionLocal()
        try:
            sess = db.get(SessionModel, session_id)
            if sess is None:
                sess = SessionModel(id=session_id, user_id=session_id)
                db.add(sess)
            sess.patient_data = patient_data
            sess.risk_result = risk_result
            sess.turn_count = state.get("turn_count", 0)

            # Persist only the newest turn (human -> ai). We assume the graph
            # is invoked once per patient message, so the tail of `messages`
            # contains the new exchange.
            for msg in messages[-4:]:  # small window catches tool chatter too
                db.add(ConversationTurn(
                    session_id=session_id,
                    role=_role_of(msg),
                    content=getattr(msg, "content", "") or "",
                    tool_name=getattr(msg, "name", None) if isinstance(msg, ToolMessage) else None,
                ))
            db.commit()
        finally:
            db.close()
    except Exception as exc:  # pragma: no cover
        log.warning("save_node: DB write failed (%s). Continuing.", exc)

    try:
        session_cache.set(session_id, {
            "patient_data": patient_data,
            "risk_result": risk_result,
            "turn_count": state.get("turn_count", 0),
        })
    except Exception as exc:  # pragma: no cover
        log.warning("save_node: Redis set failed (%s).", exc)

    # LangGraph requires at least one state channel to be written on every
    # node. Re-emitting turn_count (unchanged) is a safe no-op update.
    return {"turn_count": state.get("turn_count", 0)}
