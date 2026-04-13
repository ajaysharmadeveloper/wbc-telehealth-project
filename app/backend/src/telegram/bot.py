"""Telegram bot — routes user messages through the LangGraph triage agent.

Each Telegram chat_id maps to a persistent session (tg_{chat_id}).
The bot invokes the graph directly — no HTTP calls to the backend API.

Env vars:
    TELEGRAM_BOT_TOKEN  — from @BotFather
    TELEGRAM_ENABLED    — set to true to start the bot on FastAPI startup
"""
from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from ..agent.graph import build_graph
from ..config import settings
from ..config.session import SessionLocal
from ..models import ConversationTurn, Session as SessionModel
from ..services.memory import search_memory, add_memory
from ..services.summarizer import select_raw_messages, summarize_messages

log = logging.getLogger("triage.telegram")

# Build a dedicated graph instance for the bot
_graph = None


def _get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


# ---------------------------------------------------------------------------
# Session helpers (mirrors chat.py logic)
# ---------------------------------------------------------------------------

def _session_id_for(chat_id: int) -> str:
    return f"tg_{chat_id}"


def _load_history(session_id: str) -> tuple[list, dict[str, Any], dict[str, Any] | None, int, str]:
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
        log.exception("telegram: failed to load history for %s", session_id)
    return messages, patient_data, risk_result, turn_count, conversation_summary


def _filter_chat_messages(messages: list) -> list:
    return [
        m for m in messages
        if isinstance(m, (HumanMessage, AIMessage))
        and not getattr(m, "tool_calls", None)
        and (getattr(m, "content", "") or "").strip()
    ]


def _role_of(msg) -> str:
    if isinstance(msg, HumanMessage):
        return "user"
    if isinstance(msg, AIMessage):
        return "assistant"
    if isinstance(msg, ToolMessage):
        return "tool"
    return "system"


def _persist(session_id: str, all_messages: list, patient_data: dict,
             risk_result: dict | None, turn_count: int, conversation_summary: str):
    """Save conversation to Postgres (synchronous — runs in the bot's thread)."""
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
        finally:
            db.close()
    except Exception:
        log.exception("telegram: persist failed for %s", session_id)

    # Update summary if needed
    try:
        chat_msgs = [
            m for m in all_messages
            if isinstance(m, (HumanMessage, AIMessage))
            and not getattr(m, "tool_calls", None)
            and (getattr(m, "content", "") or "").strip()
        ]
        older, _recent = select_raw_messages(chat_msgs)
        if older:
            new_summary = summarize_messages(older, conversation_summary)
            db = SessionLocal()
            try:
                sess = db.get(SessionModel, session_id)
                if sess:
                    sess.conversation_summary = new_summary
                    db.commit()
            finally:
                db.close()
    except Exception:
        log.warning("telegram: summary update failed for %s", session_id)


# ---------------------------------------------------------------------------
# Telegram handlers
# ---------------------------------------------------------------------------

async def _start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start — welcome message."""
    await update.message.reply_text(
        "Hello! I'm the Telehealth Triage AI Assistant.\n\n"
        "I can help screen for diabetes-related concerns. "
        "Tell me about any symptoms you're experiencing, and I'll "
        "assess your risk level.\n\n"
        "Type /reset to start a fresh conversation.\n\n"
        "⚠️ This is triage support only, not medical advice."
    )


async def _reset_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /reset — clear session and start fresh."""
    session_id = _session_id_for(update.effective_chat.id)
    try:
        db = SessionLocal()
        try:
            sess = db.get(SessionModel, session_id)
            if sess:
                db.query(ConversationTurn).filter_by(session_id=session_id).delete()
                db.delete(sess)
                db.commit()
        finally:
            db.close()
    except Exception:
        log.exception("telegram: reset failed for %s", session_id)

    await update.message.reply_text(
        "Session cleared! Let's start fresh.\n"
        "Tell me about any symptoms you're experiencing."
    )


async def _handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle any text message — run through the triage agent."""
    user_text = update.message.text
    if not user_text or not user_text.strip():
        await update.message.reply_text("Please describe your symptoms so I can help you.")
        return

    chat_id = update.effective_chat.id
    session_id = _session_id_for(chat_id)

    # Show typing indicator while processing
    await update.message.chat.send_action("typing")

    # Load existing session
    all_history, patient_data, risk_result, turn_count, conversation_summary = _load_history(session_id)

    # Context windowing — only recent messages go to the agent
    chat_messages = _filter_chat_messages(all_history)
    chat_messages.append(HumanMessage(content=user_text))
    _older, recent_raw = select_raw_messages(chat_messages)

    # Search mem0 for context
    mem0_context = ""
    try:
        mem0_context = search_memory(session_id, user_text)
    except Exception as exc:
        log.warning("telegram: mem0 search failed (%s)", exc)

    # Invoke the graph
    initial_state = {
        "session_id": session_id,
        "messages": recent_raw,
        "patient_data": patient_data,
        "risk_result": risk_result,
        "turn_count": turn_count,
        "conversation_summary": conversation_summary,
        "mem0_context": mem0_context,
    }

    try:
        graph = _get_graph()
        final_state = graph.invoke(initial_state, config={"recursion_limit": 50})
    except Exception:
        log.exception("telegram: graph invocation failed for chat %s", chat_id)
        await update.message.reply_text(
            "Sorry, I encountered an error processing your message. Please try again."
        )
        return

    # Extract reply
    reply = ""
    for m in reversed(final_state.get("messages", [])):
        if isinstance(m, AIMessage) and not getattr(m, "tool_calls", None):
            reply = m.content or ""
            break

    if not reply:
        reply = "I wasn't able to generate a response. Please try rephrasing your message."

    # Build full message list for persistence
    new_user_msg = HumanMessage(content=user_text)
    graph_messages = final_state.get("messages", [])
    new_from_graph = graph_messages[len(recent_raw):]
    full_messages = all_history + [new_user_msg] + new_from_graph

    final_patient_data = final_state.get("patient_data", patient_data)
    final_risk_result = final_state.get("risk_result", risk_result)
    final_turn_count = final_state.get("turn_count", turn_count)

    # Persist to DB
    _persist(
        session_id, full_messages, final_patient_data,
        final_risk_result, final_turn_count, conversation_summary,
    )

    # Store mem0 memories
    try:
        mem0_msgs = []
        for msg in full_messages[-6:]:
            if isinstance(msg, HumanMessage) and (msg.content or "").strip():
                mem0_msgs.append({"role": "user", "content": msg.content})
            elif (isinstance(msg, AIMessage)
                  and not getattr(msg, "tool_calls", None)
                  and (msg.content or "").strip()):
                mem0_msgs.append({"role": "assistant", "content": msg.content})
        if mem0_msgs:
            add_memory(session_id, mem0_msgs)
    except Exception as exc:
        log.warning("telegram: mem0 store failed (%s)", exc)

    # Send reply (Telegram has a 4096 char limit per message)
    if len(reply) <= 4096:
        await update.message.reply_text(reply)
    else:
        for i in range(0, len(reply), 4096):
            await update.message.reply_text(reply[i:i + 4096])


# ---------------------------------------------------------------------------
# Bot lifecycle
# ---------------------------------------------------------------------------

_application: Application | None = None
_bot_loop = None


def start_bot():
    """Build and start the Telegram bot (long-polling). Call from FastAPI startup."""
    global _application, _bot_loop
    import asyncio
    import threading

    if not settings.telegram_enabled:
        log.info("Telegram bot disabled (TELEGRAM_ENABLED=false).")
        return

    token = settings.telegram_bot_token
    if not token:
        log.warning("TELEGRAM_ENABLED=true but TELEGRAM_BOT_TOKEN is empty. Bot not started.")
        return

    log.info("Starting Telegram bot (polling)...")
    _application = Application.builder().token(token).build()

    _application.add_handler(CommandHandler("start", _start_command))
    _application.add_handler(CommandHandler("reset", _reset_command))
    _application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, _handle_message))

    def _run():
        global _bot_loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        _bot_loop = loop
        loop.run_until_complete(_application.initialize())
        loop.run_until_complete(_application.start())
        loop.run_until_complete(
            _application.updater.start_polling(
                allowed_updates=Update.ALL_TYPES,
                drop_pending_updates=True,
            )
        )
        log.info("Telegram bot is running.")
        loop.run_forever()

    thread = threading.Thread(target=_run, daemon=True, name="telegram-bot")
    thread.start()


def stop_bot():
    """Stop the bot gracefully. Call from FastAPI shutdown."""
    global _application, _bot_loop
    if _application is not None and _bot_loop is not None:
        import asyncio
        import concurrent.futures

        async def _shutdown():
            await _application.updater.stop()
            await _application.stop()
            await _application.shutdown()

        try:
            future = asyncio.run_coroutine_threadsafe(_shutdown(), _bot_loop)
            future.result(timeout=10)
            _bot_loop.call_soon_threadsafe(_bot_loop.stop)
            log.info("Telegram bot stopped.")
        except Exception:
            log.exception("telegram: error stopping bot")
        _application = None
        _bot_loop = None
