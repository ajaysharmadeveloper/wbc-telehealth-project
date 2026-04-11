from langchain_core.messages import AIMessage

from src.agent.nodes.guardrail_node import guardrail_node


def test_disclaimer_appended():
    state = {
        "messages": [AIMessage(content="Your symptoms sound like a clinic visit is a good idea.")],
        "risk_result": {"level": "YELLOW", "score": 0.5},
    }
    result = guardrail_node(state)
    new_msg = result["messages"][0]
    assert "triage support" in new_msg.content


def test_diagnosis_language_scrubbed():
    state = {
        "messages": [AIMessage(content="You have diabetes definitely, you are diabetic.")],
        "risk_result": None,
    }
    result = guardrail_node(state)
    cleaned = result["messages"][0].content.lower()
    assert "you have diabetes" not in cleaned
    assert "you are diabetic" not in cleaned
    assert "definitely" not in cleaned
