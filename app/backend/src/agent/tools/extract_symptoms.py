"""Tool: extract_symptoms

Parses free-text patient input into structured fields the rule engine can
consume. Uses keyword matching against the symptom aliases defined in
``symptom_risk_mapping.json``. This is intentionally deterministic so the LLM
can reason about the *result* rather than doing extraction itself — the ReAct
loop then decides whether follow-up questions are needed.
"""
from __future__ import annotations

import re
from typing import Any

from langchain_core.tools import tool

from ...rules.loader import load_rules


_AGE_RE = re.compile(
    r"\b(?:i(?:'?m| am)\s+)(\d{1,3})\b"                          # "I'm 45"
    r"|(\d{1,3})\s*-?\s*(?:years?\s*-?\s*old|y/?o)\b"            # "45 years old" / "45-year-old"
    r"|\bage[d]?\s*(?:is|:)?\s*(\d{1,3})\b"                      # "age 45" / "aged 45"
    r"|\b(\d{1,3})\s*-?\s*year\s*-?\s*old\b",                    # "8 year old" / "70-year-old"
    re.I,
)
_DURATION_RE = re.compile(
    r"(\d+)\s*(day|days|week|weeks|month|months)", re.I
)
# Natural-language duration phrases without digits
_DURATION_PHRASES = {
    "past week": "1_to_7_days", "last week": "1_to_7_days",
    "this week": "1_to_7_days", "for a week": "1_to_7_days",
    "past few days": "1_to_7_days", "last few days": "1_to_7_days",
    "couple of days": "less_than_1_day", "yesterday": "less_than_1_day",
    "today": "less_than_1_day", "this morning": "less_than_1_day",
    "past month": "more_than_2_weeks", "last month": "more_than_2_weeks",
    "for months": "more_than_2_weeks", "for weeks": "1_to_2_weeks",
    "past couple weeks": "1_to_2_weeks", "past two weeks": "1_to_2_weeks",
    "recently": "1_to_7_days", "lately": "1_to_7_days",
}
_SEVERITY_MAP = {
    "mild": "mild", "slight": "mild", "a little": "mild",
    "moderate": "moderate", "medium": "moderate",
    "severe": "severe", "bad": "severe", "really bad": "severe",
    "worse": "severe", "getting worse": "severe", "terrible": "severe",
}

# Self-reported glucose: "glucose was 130", "blood sugar 250", "bg of 200"
_GLUCOSE_VALUE_RE = re.compile(
    r"(?:blood\s*sugar|glucose|fasting\s*glucose|bg|fasting\s*plasma\s*glucose)"
    r"\s*(?:is|was|of|at|=|:)?\s*(\d{2,4})\s*(?:mg/?dl)?",
    re.I,
)

# Medical history detection
_KNOWN_DIABETES_PHRASES = [
    "i'm diabetic", "i am diabetic", "i'm a diabetic",
    "i have diabetes", "diagnosed with diabetes",
    "known diabetic", "type 1", "type 2",
    "on metformin", "on insulin", "taking metformin", "taking insulin",
    "been on metformin", "been on insulin",
]
_GDM_PHRASES = [
    "gestational diabetes", "diabetes during pregnancy",
    "diabetes during my pregnancy", "gdm",
]
_FAMILY_HISTORY_PHRASES = [
    "mother had diabetes", "father had diabetes",
    "parent had diabetes", "family history of diabetes",
    "runs in my family", "mother had type",
    "father had type", "mom had diabetes", "dad had diabetes",
]
_MEDICATION_NON_ADHERENCE_PHRASES = [
    "forgetting to take", "forget to take", "keep forgetting",
    "not taking my", "stopped taking", "skip my medication",
    "don't take it regularly", "non-adherent", "non adherent",
    "not been taking",
]


def _detect_symptoms(text: str) -> list[str]:
    rules = load_rules()["symptom_risk"]
    text_l = text.lower()
    found: list[str] = []
    for key, spec in rules["primary_symptoms"].items():
        aliases = [key.replace("_", " "), *spec.get("aliases", [])]
        if any(alias in text_l for alias in aliases):
            found.append(key)
    return found


def _detect_age(text: str) -> int | None:
    m = _AGE_RE.search(text)
    if not m:
        return None
    # One of the alternation groups will be non-None
    raw = next((g for g in m.groups() if g is not None), None)
    if raw is None:
        return None
    age = int(raw)
    return age if 0 < age < 120 else None


def _detect_duration(text: str) -> str | None:
    m = _DURATION_RE.search(text)
    if m:
        n, unit = int(m.group(1)), m.group(2).lower()
        if "day" in unit:
            return "less_than_1_day" if n < 1 else ("1_to_7_days" if n <= 7 else "1_to_2_weeks")
        if "week" in unit:
            return "1_to_2_weeks" if n <= 2 else "more_than_2_weeks"
        if "month" in unit:
            return "more_than_2_weeks"
    # Fallback: check natural-language phrases
    text_l = text.lower()
    for phrase, duration in _DURATION_PHRASES.items():
        if phrase in text_l:
            return duration
    return None


def _detect_severity(text: str) -> str | None:
    text_l = text.lower()
    for phrase, level in _SEVERITY_MAP.items():
        if phrase in text_l:
            return level
    return None


def _detect_glucose(text: str) -> int | None:
    """Extract self-reported glucose value in mg/dL."""
    m = _GLUCOSE_VALUE_RE.search(text)
    if not m:
        return None
    try:
        val = int(m.group(1))
        return val if 20 <= val <= 900 else None
    except ValueError:
        return None


def _detect_medical_history(text: str) -> dict[str, Any]:
    """Detect diabetes history, family history, medication status."""
    text_l = text.lower()
    result: dict[str, Any] = {}

    if any(p in text_l for p in _KNOWN_DIABETES_PHRASES):
        result["known_diabetes"] = True

    if any(p in text_l for p in _GDM_PHRASES):
        result["history_gestational_diabetes"] = True

    if any(p in text_l for p in _FAMILY_HISTORY_PHRASES):
        result["family_history_diabetes"] = True

    if any(p in text_l for p in _MEDICATION_NON_ADHERENCE_PHRASES):
        result["medication_adherent"] = False

    return result


@tool
def extract_symptoms(text: str) -> dict[str, Any]:
    """Extract structured patient data from a free-text message.

    Returns a dict with keys: symptoms, age, duration, severity,
    diabetes_indicators, self_reported_glucose, known_diabetes,
    history_gestational_diabetes, family_history_diabetes,
    medication_adherent. Any field may be ``None`` when not found.
    """
    symptoms = _detect_symptoms(text)
    diabetes_indicators = [
        s for s in symptoms
        if s in {"polyuria", "polydipsia", "polyphagia",
                 "unexplained_weight_loss", "blurred_vision"}
    ]
    history = _detect_medical_history(text)
    glucose = _detect_glucose(text)

    result: dict[str, Any] = {
        "symptoms": symptoms,
        "age": _detect_age(text),
        "duration": _detect_duration(text),
        "severity": _detect_severity(text),
        "diabetes_indicators": diabetes_indicators,
    }

    if glucose is not None:
        result["self_reported_glucose"] = glucose
    # Merge medical history flags (only set when detected)
    result.update(history)

    return result
