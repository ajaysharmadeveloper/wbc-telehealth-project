"""Agent Node — LLM reasons, picks tools, or produces a final response."""
from __future__ import annotations

from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI

from ...config import settings
from ..prompts.system_prompt import SYSTEM_PROMPT
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


def agent_node(state: AgentState) -> dict:
    """Run the LLM with the system prompt + conversation so far."""
    messages = state.get("messages", [])
    # Always prepend the system prompt (LangGraph dedupes by content implicitly
    # when the same message comes back through add_messages).
    to_send = [SystemMessage(content=SYSTEM_PROMPT), *messages]
    ai_msg = _get_llm().invoke(to_send)
    return {
        "messages": [ai_msg],
        "turn_count": state.get("turn_count", 0) + 1,
    }
