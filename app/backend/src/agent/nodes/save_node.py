"""Save Node — no-op passthrough.

All persistence (DB, mem0, summarization, Redis) has been moved to async
background tasks in the chat API layer so the agent response is not blocked.
This node is kept for backward compatibility with the graph wiring.
"""
from __future__ import annotations

from ..state import AgentState


def save_node(state: AgentState) -> dict:
    """Pass through — persistence handled asynchronously after graph returns."""
    return {"turn_count": state.get("turn_count", 0)}
