"""AgentState — the shared state that flows through every LangGraph node."""
from __future__ import annotations

from typing import Annotated, Any, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    """State schema for the diabetes triage ReAct agent.

    Mirrors the design in docs/backend/plan/.../ai_agent_architecture.md.
    """

    session_id: str
    # `add_messages` makes LangGraph append rather than overwrite
    messages: Annotated[list[BaseMessage], add_messages]
    patient_data: dict[str, Any]
    risk_result: dict[str, Any] | None
    turn_count: int
    conversation_summary: str
    mem0_context: str
