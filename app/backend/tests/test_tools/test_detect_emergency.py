from src.agent.tools.detect_emergency import detect_emergency


def test_flags_fruity_breath():
    result = detect_emergency.invoke({"text": "I have fruity breath and I've been vomiting"})
    assert result["emergency"] is True
    assert result["triage_override"] == "RED"
    assert any("fruity breath" in r for r in result["reasons"])


def test_flags_high_glucose_self_report():
    result = detect_emergency.invoke({"text": "my blood sugar is 420 and I feel awful"})
    assert result["emergency"] is True
    assert result["triage_override"] == "RED"


def test_flags_low_glucose_self_report():
    result = detect_emergency.invoke({"text": "my glucose was 45 this morning"})
    assert result["emergency"] is True


def test_no_emergency_for_mild_text():
    result = detect_emergency.invoke({"text": "I feel a little tired lately"})
    assert result["emergency"] is False
    assert result["triage_override"] is None
