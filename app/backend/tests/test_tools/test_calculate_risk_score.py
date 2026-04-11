from src.agent.tools.calculate_risk_score import calculate_risk_score


def test_green_for_single_mild_symptom():
    result = calculate_risk_score.invoke({
        "patient_data": {
            "age": 30,
            "symptoms": ["dry_skin_itching"],
            "severity": "mild",
            "duration": "1_to_7_days",
        }
    })
    assert result["level"] == "GREEN"


def test_yellow_for_multiple_moderate_symptoms():
    result = calculate_risk_score.invoke({
        "patient_data": {
            "age": 45,
            "symptoms": ["polyuria", "polydipsia", "fatigue"],
            "severity": "moderate",
            "duration": "1_to_2_weeks",
        }
    })
    assert result["level"] in {"YELLOW", "RED"}


def test_red_for_severe_multi_symptom_with_amplifiers():
    result = calculate_risk_score.invoke({
        "patient_data": {
            "age": 65,
            "symptoms": [
                "polyuria", "polydipsia", "unexplained_weight_loss",
                "blurred_vision", "fatigue",
            ],
            "severity": "severe",
            "duration": "more_than_2_weeks",
            "known_diabetes": True,
            "medication_adherent": False,
        }
    })
    assert result["level"] == "RED"
    assert result["score"] >= 0.7
