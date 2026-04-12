from src.agent.tools.check_completeness import check_completeness


def test_missing_fields_reported():
    result = check_completeness.invoke({"patient_data": {"age": 40}})
    assert result["complete"] is False
    assert "symptoms" in result["missing"]
    assert "duration" in result["missing"]
    assert "severity" in result["missing"]


def test_complete_when_all_fields_present():
    result = check_completeness.invoke({
        "patient_data": {
            "age": 40,
            "symptoms": ["polyuria"],
            "duration": "1_to_2_weeks",
            "severity": "moderate",
        }
    })
    assert result["complete"] is True
    assert result["missing"] == []
