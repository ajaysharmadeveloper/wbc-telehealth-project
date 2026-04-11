"""LangGraph assembly: START -> agent -> (tools ⟲ agent) -> guardrail -> save -> END."""
from __future__ import annotations

from functools import lru_cache

from langchain_core.messages import AIMessage
from langgraph.graph import END, START, StateGraph

from .nodes.agent_node import agent_node
from .nodes.guardrail_node import guardrail_node
from .nodes.save_node import save_node
from .nodes.tools_node import tools_node
from .state import AgentState


def _route_from_agent(state: AgentState) -> str:
    """Conditional edge out of the Agent Node.

    If the LLM requested tool calls, loop through the Tools Node; otherwise
    hand off to the Guardrail Node for final safety checks.
    """
    messages = state.get("messages", [])
    if not messages:
        return "guardrail"
    last = messages[-1]
    if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
        return "tools"
    return "guardrail"


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("agent", agent_node)
    graph.add_node("tools", tools_node)
    graph.add_node("guardrail", guardrail_node)
    graph.add_node("save", save_node)

    graph.add_edge(START, "agent")
    graph.add_conditional_edges(
        "agent",
        _route_from_agent,
        {"tools": "tools", "guardrail": "guardrail"},
    )
    graph.add_edge("tools", "agent")       # ReAct loop
    graph.add_edge("guardrail", "save")
    graph.add_edge("save", END)

    return graph.compile()


@lru_cache(maxsize=1)
def get_compiled_graph():
    """Return a process-wide singleton compiled graph."""
    return build_graph()
