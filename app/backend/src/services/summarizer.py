"""Conversation summarizer — dual-threshold context management.

Summarizes older messages when conversation exceeds either:
1. Message count threshold (default 5 messages)
2. Token limit for raw messages (default 2000 tokens)

Uses tiktoken for accurate OpenAI token counting and OpenAI for summarization.
"""
from __future__ import annotations

import logging
from typing import Any

import tiktoken
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from openai import OpenAI

from ..config import settings

log = logging.getLogger(__name__)

_encoding = None


def _get_encoding():
    global _encoding
    if _encoding is None:
        _encoding = tiktoken.encoding_for_model(settings.openai_model)
    return _encoding


def count_tokens(text: str) -> int:
    """Count tokens in a string using tiktoken."""
    return len(_get_encoding().encode(text))


def count_message_tokens(messages: list[BaseMessage]) -> int:
    """Count total tokens across a list of LangChain messages."""
    total = 0
    for msg in messages:
        content = getattr(msg, "content", "") or ""
        total += count_tokens(content)
    return total


def select_raw_messages(
    messages: list[BaseMessage],
    max_count: int | None = None,
    max_tokens: int | None = None,
) -> tuple[list[BaseMessage], list[BaseMessage]]:
    """Split messages into (older, recent_raw) using dual threshold.

    Walks backwards from the most recent message, adding to the raw bucket
    while both count < max_count AND cumulative tokens < max_tokens.
    Always keeps at least 1 raw message.

    Args:
        messages: All user+assistant messages in chronological order.
        max_count: Max raw messages (default from settings).
        max_tokens: Max tokens for raw messages (default from settings).

    Returns:
        (older_messages, recent_raw_messages)
    """
    if max_count is None:
        max_count = settings.context_max_raw_messages
    if max_tokens is None:
        max_tokens = settings.context_token_limit

    if not messages:
        return [], []

    # Walk backwards, accumulate raw messages
    raw_indices: list[int] = []
    token_total = 0

    for i in range(len(messages) - 1, -1, -1):
        msg_tokens = count_tokens(getattr(messages[i], "content", "") or "")

        # Always keep at least 1 message
        if not raw_indices:
            raw_indices.append(i)
            token_total += msg_tokens
            continue

        # Check both thresholds
        if len(raw_indices) >= max_count:
            break
        if token_total + msg_tokens > max_tokens:
            break

        raw_indices.append(i)
        token_total += msg_tokens

    raw_indices.reverse()
    cutoff = raw_indices[0] if raw_indices else len(messages)

    older = messages[:cutoff]
    recent = [messages[i] for i in raw_indices]

    return older, recent


def summarize_messages(
    messages: list[BaseMessage],
    existing_summary: str | None = None,
) -> str:
    """Summarize conversation messages into a concise context string.

    If an existing summary is provided, it's incorporated as prior context
    so the new summary is incremental.

    Args:
        messages: The older messages to summarize.
        existing_summary: Previous summary to build upon.

    Returns:
        A concise summary string.
    """
    # Filter out messages with empty content (tool-call AIMessages)
    non_empty = [m for m in messages if (getattr(m, "content", "") or "").strip()]
    if not non_empty:
        return existing_summary or ""

    # Build conversation text for summarization
    lines = []
    if existing_summary:
        lines.append(f"Previous conversation summary:\n{existing_summary}\n")

    lines.append("New messages to incorporate:")
    for msg in non_empty:
        role = "Patient" if isinstance(msg, HumanMessage) else "Assistant"
        content = getattr(msg, "content", "") or ""
        lines.append(f"{role}: {content}")

    conversation_text = "\n".join(lines)

    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.1,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a medical conversation summarizer. Create a concise summary "
                        "of the patient-assistant conversation that preserves:\n"
                        "- Patient symptoms reported and their details (severity, duration)\n"
                        "- Patient demographics (age, relevant medical history)\n"
                        "- Risk assessment results and triage level\n"
                        "- Key decisions or actions taken (appointments booked, etc.)\n"
                        "- Any emergency flags or concerns raised\n\n"
                        "Keep the summary factual, under 200 words, and structured for an AI "
                        "assistant to use as context for continuing the conversation."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Summarize this conversation:\n\n{conversation_text}",
                },
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        log.warning("Summarization failed: %s", exc)
        return existing_summary or ""
