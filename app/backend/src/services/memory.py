"""Mem0 memory service — stores and retrieves session-level patient context.

Sessions are anonymous, so memories are keyed by session_id.
Uses Qdrant local file storage (no extra Docker container).
"""
from __future__ import annotations

import logging
from typing import Any

from ..config import settings

log = logging.getLogger(__name__)

_memory = None


def _get_memory():
    global _memory
    if _memory is not None:
        return _memory

    if not settings.mem0_enabled:
        return None

    try:
        from mem0 import Memory

        config = {
            "llm": {
                "provider": "openai",
                "config": {
                    "model": settings.openai_model,
                    "api_key": settings.openai_api_key,
                },
            },
            "vector_store": {
                "provider": "qdrant",
                "config": {
                    "collection_name": "telehealth_memories",
                    "path": "/tmp/qdrant_telehealth",
                },
            },
        }
        _memory = Memory.from_config(config)
        log.info("Mem0 memory service initialized.")
    except Exception as exc:
        log.warning("Mem0 initialization failed (%s). Memory features disabled.", exc)
        _memory = None

    return _memory


def add_memory(session_id: str, messages: list[dict[str, str]]) -> None:
    """Store conversation facts into mem0 for a session.

    Args:
        session_id: The session identifier (anonymous user).
        messages: List of {"role": "user"|"assistant", "content": "..."} dicts.
    """
    mem = _get_memory()
    if mem is None:
        return

    try:
        mem.add(messages, user_id=session_id)
    except Exception as exc:
        log.warning("mem0 add failed for session %s: %s", session_id, exc)


def search_memory(session_id: str, query: str, limit: int = 5) -> str:
    """Search mem0 for relevant memories and return as formatted context string.

    Args:
        session_id: The session identifier.
        query: The search query (typically the latest user message).
        limit: Max number of memory results.

    Returns:
        Formatted string of relevant memories, or empty string if none found.
    """
    mem = _get_memory()
    if mem is None:
        return ""

    try:
        results = mem.search(query, user_id=session_id, limit=limit)
        if not results or not results.get("results"):
            return ""

        memories = []
        for r in results["results"]:
            memory_text = r.get("memory", "")
            if memory_text:
                memories.append(f"- {memory_text}")

        if not memories:
            return ""

        return "Relevant patient context from earlier in this session:\n" + "\n".join(memories)
    except Exception as exc:
        log.warning("mem0 search failed for session %s: %s", session_id, exc)
        return ""
