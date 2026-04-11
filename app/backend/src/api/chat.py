"""POST /chat — drive one turn through the compiled LangGraph."""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import BaseModel, Field

from ..agent.graph import get_compiled_graph
from ..db.models import ConversationTurn, Session as SessionModel
from ..db.session import SessionLocal

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    risk_result: dict[str, Any] | None = None
    turn_count: int


def _load_history(session_id: str) -> tuple[list, dict[str, Any], dict[str, Any] | None, int]:
    """Rehydrate past messages + patient data + risk result from Postgres."""
    messages: list = []
    patient_data: dict[str, Any] = {}
    risk_result: dict[str, Any] | None = None
    turn_count = 0
    try:
        db = SessionLocal()
        try:
            sess = db.get(SessionModel, session_id)
            if sess:
                patient_data = sess.patient_data or {}
                risk_result = sess.risk_result
                turn_count = sess.turn_count or 0
                for t in sorted(sess.turns, key=lambda t: t.id):
                    if t.role == "user":
                        messages.append(HumanMessage(content=t.content))
                    elif t.role == "assistant":
                        messages.append(AIMessage(content=t.content))
        finally:
            db.close()
    except Exception:
        # DB not available (e.g. first local smoke run) — start a clean session
        pass
    return messages, patient_data, risk_result, turn_count


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    session_id = req.session_id or f"sess_{uuid.uuid4().hex[:12]}"
    history, patient_data, risk_result, turn_count = _load_history(session_id)

    initial_state = {
        "session_id": session_id,
        "messages": [*history, HumanMessage(content=req.message)],
        "patient_data": patient_data,
        "risk_result": risk_result,
        "turn_count": turn_count,
    }

    graph = get_compiled_graph()
    final_state = graph.invoke(initial_state)

    # The last AIMessage is the assistant's reply for this turn
    reply = ""
    for m in reversed(final_state.get("messages", [])):
        if isinstance(m, AIMessage) and not getattr(m, "tool_calls", None):
            reply = m.content or ""
            break

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        risk_result=final_state.get("risk_result"),
        turn_count=final_state.get("turn_count", turn_count),
    )
