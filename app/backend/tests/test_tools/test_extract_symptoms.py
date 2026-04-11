from src.agent.tools.extract_symptoms import extract_symptoms


def test_extracts_diabetes_symptoms_and_duration():
    text = "I've been really thirsty and peeing a lot for 2 weeks. I'm 45 years old and it's getting worse."
    result = extract_symptoms.invoke({"text": text})

    assert "polydipsia" in result["symptoms"]
    assert "polyuria" in result["symptoms"]
    assert result["age"] == 45
    assert result["duration"] in {"1_to_2_weeks", "more_than_2_weeks"}
    assert result["severity"] == "severe"
    assert "polydipsia" in result["diabetes_indicators"]


def test_handles_empty_text():
    result = extract_symptoms.invoke({"text": "hello"})
    assert result["symptoms"] == []
    assert result["age"] is None
