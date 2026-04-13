"""Agent Node — LLM reasons, picks tools, or produces a final response."""
from __future__ import annotations

from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI

from ...config import settings
from ..prompts.system_prompt import get_system_prompt
from ..state import AgentState
from ..tools import ALL_TOOLS


def _build_llm() -> ChatOpenAI:
    llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key or None,
        temperature=0.2,
    )
    return llm.bind_tools(ALL_TOOLS)


_llm = None


def _get_llm() -> ChatOpenAI:
    global _llm
    if _llm is None:
        _llm = _build_llm()
    return _llm


def _build_system_content(state: AgentState) -> str:
    """Build the full system prompt with memory context and conversation summary."""
    parts = [get_system_prompt()]

    mem0_context = state.get("mem0_context", "")
    if mem0_context:
        parts.append(f"\n\nPATIENT MEMORY (from earlier in this session):\n{mem0_context}")

    conversation_summary = state.get("conversation_summary", "")
    if conversation_summary:
        parts.append(
            f"\n\nPREVIOUS CONVERSATION SUMMARY:\n{conversation_summary}\n\n"
            "Use this summary as context for earlier parts of the conversation. "
            "The recent messages below are the latest exchanges."
        )

    return "".join(parts)


def agent_node(state: AgentState) -> dict:
    """Run the LLM with the system prompt + conversation so far."""
    messages = state.get("messages", [])
    system_content = _build_system_content(state)
    to_send = [SystemMessage(content=system_content), *messages]
    ai_msg = _get_llm().invoke(to_send)
    return {
        "messages": [ai_msg],
        "turn_count": state.get("turn_count", 0) + 1,
    }
