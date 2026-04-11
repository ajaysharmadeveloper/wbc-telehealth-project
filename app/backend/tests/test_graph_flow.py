"""Graph smoke test — routes correctly without hitting OpenAI.

We monkeypatch the agent node so no real LLM call is made; we only check that
tool routing, guardrail, and save steps run end-to-end.
"""
from langchain_core.messages import AIMessage, HumanMessage

from src.agent import graph as graph_module
from src.agent.nodes import agent_node as agent_node_module


def _fake_agent_node(state):
    # First pass: return plain assistant response with no tool calls
    return {
        "messages": [AIMessage(content="You described classic diabetes symptoms.")],
        "turn_count": state.get("turn_count", 0) + 1,
    }


def test_graph_runs_end_to_end(monkeypatch):
    monkeypatch.setattr(agent_node_module, "agent_node", _fake_agent_node)
    # Also patch inside the graph module (it imports the function directly)
    monkeypatch.setattr(graph_module, "agent_node", _fake_agent_node)
    # Rebuild the compiled graph so our patched function is used
    graph_module.get_compiled_graph.cache_clear()

    compiled = graph_module.get_compiled_graph()

    state = {
        "session_id": "test-session",
        "messages": [HumanMessage(content="I've been really thirsty for 2 weeks")],
        "patient_data": {},
        "risk_result": None,
        "turn_count": 0,
    }

    final = compiled.invoke(state)

    assert final["turn_count"] == 1
    # Guardrail must have appended the disclaimer
    final_ai = [m for m in final["messages"] if isinstance(m, AIMessage)][-1]
    assert "triage support" in final_ai.content
