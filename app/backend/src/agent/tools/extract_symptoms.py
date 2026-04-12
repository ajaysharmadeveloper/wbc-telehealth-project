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
    r"|(\d{1,3})\s*(?:years?\s*old|y/?o)\b"                      # "45 years old"
    r"|\bage[d]?\s*(?:is|:)?\s*(\d{1,3})\b",                     # "age 45" / "aged 45"
    re.I,
)
_DURATION_RE = re.compile(
    r"(\d+)\s*(day|days|week|weeks|month|months)", re.I
)
_SEVERITY_MAP = {
    "mild": "mild", "slight": "mild", "a little": "mild",
    "moderate": "moderate", "medium": "moderate",
    "severe": "severe", "bad": "severe", "really bad": "severe",
    "worse": "severe", "getting worse": "severe", "terrible": "severe",
}


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
    if not m:
        return None
    n, unit = int(m.group(1)), m.group(2).lower()
    if "day" in unit:
        return "less_than_1_day" if n < 1 else ("1_to_7_days" if n <= 7 else "1_to_2_weeks")
    if "week" in unit:
        return "1_to_2_weeks" if n <= 2 else "more_than_2_weeks"
    if "month" in unit:
        return "more_than_2_weeks"
    return None


def _detect_severity(text: str) -> str | None:
    text_l = text.lower()
    for phrase, level in _SEVERITY_MAP.items():
        if phrase in text_l:
            return level
    return None


@tool
def extract_symptoms(text: str) -> dict[str, Any]:
    """Extract structured patient data from a free-text message.

    Returns a dict with keys: symptoms, age, duration, severity,
    diabetes_indicators. Any field may be ``None`` when not found.
    """
    symptoms = _detect_symptoms(text)
    diabetes_indicators = [
        s for s in symptoms
        if s in {"polyuria", "polydipsia", "polyphagia",
                 "unexplained_weight_loss", "blurred_vision"}
    ]
    return {
        "symptoms": symptoms,
        "age": _detect_age(text),
        "duration": _detect_duration(text),
        "severity": _detect_severity(text),
        "diabetes_indicators": diabetes_indicators,
    }
