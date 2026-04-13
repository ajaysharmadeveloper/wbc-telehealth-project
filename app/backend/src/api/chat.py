"""POST /chat — drive one turn through the compiled LangGraph.

Persistence (DB save, mem0, summarization) runs as async background tasks
so the user gets a response immediately without waiting for I/O.
"""
from __future__ import annotations

import logging
import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from pydantic import BaseModel, Field

from ..agent.graph import get_compiled_graph
from ..models import ConversationTurn, Session as SessionModel
from ..config.session import SessionLocal
from ..services.memory import search_memory
from ..services.summarizer import select_raw_messages
from ..services.background_tasks import persist_conversation, store_memories, update_summary

log = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    risk_result: dict[str, Any] | None = None
    turn_count: int


def _load_history(session_id: str) -> tuple[list, dict[str, Any], dict[str, Any] | None, int, str]:
    """Rehydrate past messages + patient data + risk result + summary from Postgres.

    Loads ALL message types (user, assistant, tool) so the message index
    stays aligned with what save_node persisted.
    """
    messages: list = []
    patient_data: dict[str, Any] = {}
    risk_result: dict[str, Any] | None = None
    turn_count = 0
    conversation_summary = ""
    try:
        db = SessionLocal()
        try:
            sess = db.get(SessionModel, session_id)
            if sess:
                patient_data = sess.patient_data or {}
                risk_result = sess.risk_result
                turn_count = sess.turn_count or 0
                conversation_summary = sess.conversation_summary or ""
                for t in sorted(sess.turns, key=lambda t: t.id):
                    if t.role == "user":
                        messages.append(HumanMessage(content=t.content))
                    elif t.role == "assistant":
                        messages.append(AIMessage(content=t.content))
                    elif t.role == "tool":
                        messages.append(ToolMessage(
                            content=t.content,
                            tool_call_id=f"hist_{t.id}",
                            name=t.tool_name or "",
                        ))
        finally:
            db.close()
    except Exception:
        pass
    return messages, patient_data, risk_result, turn_count, conversation_summary


def _filter_chat_messages(messages: list) -> list:
    """Filter to only user+assistant messages with actual content (for context windowing)."""
    return [
        m for m in messages
        if isinstance(m, (HumanMessage, AIMessage))
        and not getattr(m, "tool_calls", None)
        and (getattr(m, "content", "") or "").strip()
    ]


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, bg: BackgroundTasks) -> ChatResponse:
    session_id = req.session_id or f"sess_{uuid.uuid4().hex[:12]}"
    all_history, patient_data, risk_result, turn_count, conversation_summary = _load_history(session_id)

    # For the agent context window: apply dual-threshold on chat messages only
    chat_messages = _filter_chat_messages(all_history)
    chat_messages.append(HumanMessage(content=req.message))
    _older, recent_raw = select_raw_messages(chat_messages)

    # Search mem0 for relevant memories
    mem0_context = ""
    try:
        mem0_context = search_memory(session_id, req.message)
    except Exception as exc:
        log.warning("chat: mem0 search failed (%s).", exc)

    # Build state for the graph — only recent raw messages go to the agent
    initial_state = {
        "session_id": session_id,
        "messages": recent_raw,
        "patient_data": patient_data,
        "risk_result": risk_result,
        "turn_count": turn_count,
        "conversation_summary": conversation_summary,
        "mem0_context": mem0_context,
    }

    graph = get_compiled_graph()
    final_state = graph.invoke(initial_state, config={"recursion_limit": 50})

    # Extract the assistant's reply
    reply = ""
    for m in reversed(final_state.get("messages", [])):
        if isinstance(m, AIMessage) and not getattr(m, "tool_calls", None):
            reply = m.content or ""
            break

    final_turn_count = final_state.get("turn_count", turn_count)
    final_patient_data = final_state.get("patient_data", patient_data)
    final_risk_result = final_state.get("risk_result", risk_result)

    # Build the full message list for persistence:
    # all_history (from DB) + new HumanMessage + graph-generated messages
    new_user_msg = HumanMessage(content=req.message)
    graph_messages = final_state.get("messages", [])
    # The graph received recent_raw as input. New messages are those added by the graph.
    # Since add_messages appends, graph_messages = recent_raw + new_from_graph
    new_from_graph = graph_messages[len(recent_raw):]
    full_messages = all_history + [new_user_msg] + new_from_graph

    # Schedule background tasks — these run AFTER the response is sent
    bg.add_task(
        persist_conversation,
        session_id=session_id,
        all_messages=full_messages,
        patient_data=final_patient_data,
        risk_result=final_risk_result,
        turn_count=final_turn_count,
        conversation_summary=conversation_summary,
    )
    bg.add_task(
        store_memories,
        session_id=session_id,
        all_messages=full_messages,
    )
    bg.add_task(
        update_summary,
        session_id=session_id,
        all_messages=full_messages,
        existing_summary=conversation_summary,
    )

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        risk_result=final_risk_result,
        turn_count=final_turn_count,
    )
