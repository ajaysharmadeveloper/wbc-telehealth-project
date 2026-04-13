"""Async background tasks for post-response persistence.

These run after the chat response is sent to the user, so they don't
block the conversation. Handles: DB save, mem0 memory, summarization,
Redis cache refresh.
"""
from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage

from ..config.session import SessionLocal
from ..models import ConversationTurn, Session as SessionModel
from ..services.memory import add_memory
from ..services.session_cache import session_cache
from ..services.summarizer import select_raw_messages, summarize_messages

log = logging.getLogger(__name__)


def _role_of(msg: BaseMessage) -> str:
    if isinstance(msg, HumanMessage):
        return "user"
    if isinstance(msg, AIMessage):
        return "assistant"
    if isinstance(msg, ToolMessage):
        return "tool"
    return "system"


def persist_conversation(
    session_id: str,
    all_messages: list[BaseMessage],
    patient_data: dict[str, Any],
    risk_result: dict[str, Any] | None,
    turn_count: int,
    conversation_summary: str,
) -> None:
    """Save conversation turn to Postgres + refresh Redis cache.

    Called as a FastAPI background task — runs after response is sent.
    """
    try:
        db = SessionLocal()
        try:
            sess = db.get(SessionModel, session_id)
            if sess is None:
                sess = SessionModel(id=session_id, user_id=session_id)
                db.add(sess)

            sess.patient_data = patient_data
            sess.risk_result = risk_result
            sess.turn_count = turn_count

            # Find new messages: count existing turns in DB, save everything after
            existing_count = (
                db.query(ConversationTurn)
                .filter_by(session_id=session_id)
                .count()
            )
            new_messages = all_messages[existing_count:]
            for msg in new_messages:
                db.add(ConversationTurn(
                    session_id=session_id,
                    role=_role_of(msg),
                    content=getattr(msg, "content", "") or "",
                    tool_name=(
                        getattr(msg, "name", None)
                        if isinstance(msg, ToolMessage)
                        else None
                    ),
                ))

            db.commit()
            log.info(
                "persist_conversation: saved %d new messages for session %s",
                len(new_messages), session_id,
            )
        finally:
            db.close()
    except Exception as exc:
        log.warning("persist_conversation: DB write failed (%s).", exc)

    # Refresh Redis cache
    try:
        session_cache.set(session_id, {
            "patient_data": patient_data,
            "risk_result": risk_result,
            "turn_count": turn_count,
            "conversation_summary": conversation_summary,
        })
    except Exception as exc:
        log.warning("persist_conversation: Redis set failed (%s).", exc)


def store_memories(
    session_id: str,
    all_messages: list[BaseMessage],
) -> None:
    """Extract and store conversation facts in mem0.

    Called as a FastAPI background task — runs after response is sent.
    """
    try:
        # Collect the latest user+assistant exchange for mem0
        mem0_msgs = []
        for msg in all_messages[-6:]:  # recent window
            if isinstance(msg, HumanMessage) and (msg.content or "").strip():
                mem0_msgs.append({"role": "user", "content": msg.content})
            elif (
                isinstance(msg, AIMessage)
                and not getattr(msg, "tool_calls", None)
                and (msg.content or "").strip()
            ):
                mem0_msgs.append({"role": "assistant", "content": msg.content})

        if mem0_msgs:
            add_memory(session_id, mem0_msgs)
            log.info("store_memories: stored %d messages for session %s", len(mem0_msgs), session_id)
    except Exception as exc:
        log.warning("store_memories: mem0 add failed (%s).", exc)


def update_summary(
    session_id: str,
    all_messages: list[BaseMessage],
    existing_summary: str,
) -> None:
    """Summarize older messages if dual threshold is exceeded.

    Called as a FastAPI background task — runs after response is sent.
    """
    try:
        # Filter to only meaningful chat messages (non-empty, non-tool-call)
        chat_messages = [
            m for m in all_messages
            if isinstance(m, (HumanMessage, AIMessage))
            and not getattr(m, "tool_calls", None)
            and (getattr(m, "content", "") or "").strip()
        ]

        older, _recent = select_raw_messages(chat_messages)
        if not older:
            return

        new_summary = summarize_messages(older, existing_summary)
        log.info(
            "update_summary: summarized %d older messages for session %s",
            len(older), session_id,
        )

        # Persist to DB
        db = SessionLocal()
        try:
            sess = db.get(SessionModel, session_id)
            if sess:
                sess.conversation_summary = new_summary
                db.commit()
        finally:
            db.close()

        # Update Redis cache too
        try:
            cached = session_cache.get(session_id)
            if cached:
                cached["conversation_summary"] = new_summary
                session_cache.set(session_id, cached)
        except Exception:
            pass

    except Exception as exc:
        log.warning("update_summary: failed (%s).", exc)
