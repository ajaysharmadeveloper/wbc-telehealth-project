"""Tool: calculate_risk_score — hybrid rule engine producing GREEN/YELLOW/RED."""
from __future__ import annotations

import operator
from typing import Any

from langchain_core.tools import tool

from ...rules.loader import load_rules


_OPS = {
    "==": operator.eq,
    "!=": operator.ne,
    ">":  operator.gt,
    ">=": operator.ge,
    "<":  operator.lt,
    "<=": operator.le,
}


def _apply_amplifiers(patient_data: dict[str, Any]) -> tuple[float, list[str]]:
    amp_cfg = load_rules()["risk_amplifiers"]
    cap = amp_cfg.get("max_amplifier_contribution", 0.3)
    total = 0.0
    matched: list[str] = []
    # Enrich patient_data with derived fields used by amplifier conditions
    symptom_count = len(patient_data.get("symptoms") or [])
    derived = {
        **patient_data,
        "symptom_count": symptom_count,
        "duration_weeks": _duration_to_weeks(patient_data.get("duration")),
    }
    for rule in amp_cfg["amplifiers"]:
        cond = rule["condition"]
        field_val = derived.get(cond["field"])
        if field_val is None:
            continue
        op = _OPS.get(cond["op"])
        if op is None:
            continue
        try:
            if op(field_val, cond["value"]):
                total += rule["weight"]
                matched.append(rule["key"])
        except TypeError:
            continue
    return min(total, cap), matched


def _duration_to_weeks(duration: str | None) -> float:
    if not duration:
        return 0.0
    return {
        "less_than_1_day":   0.1,
        "1_to_7_days":       1.0,
        "1_to_2_weeks":      2.0,
        "more_than_2_weeks": 4.0,
    }.get(duration, 0.0)


def _band_for_score(score: float) -> dict[str, Any]:
    bands = load_rules()["symptom_risk"]["triage_bands"]
    for _key, band in bands.items():
        if band["min"] <= score < band["max"]:
            return band
    return bands["red"]


@tool
def calculate_risk_score(patient_data: dict[str, Any]) -> dict[str, Any]:
    """Score the patient's triage risk.

    Returns: {level: GREEN|YELLOW|RED, score: float, recommendation: str,
              contributing: {symptoms: [...], amplifiers: [...]}}
    """
    rules = load_rules()["symptom_risk"]
    symptoms: list[str] = patient_data.get("symptoms") or []
    severity = patient_data.get("severity") or "moderate"
    duration = patient_data.get("duration") or "1_to_7_days"

    base = sum(
        rules["primary_symptoms"].get(s, {}).get("weight", 0.0)
        for s in symptoms
    )
    sev_mul = rules["severity_multipliers"].get(severity, 1.0)
    dur_mul = rules["duration_multipliers"].get(duration, 1.0)
    symptom_score = min(base * sev_mul * dur_mul, 1.0)

    # Self-reported glucose adds a base score component (ADA thresholds)
    glucose = patient_data.get("self_reported_glucose")
    glucose_score = 0.0
    if glucose is not None:
        if glucose >= 300:
            glucose_score = 0.70   # RED territory — symptomatic hyperglycemia
        elif glucose >= 200:
            glucose_score = 0.45   # YELLOW — above random diagnostic threshold
        elif glucose >= 126:
            glucose_score = 0.35   # YELLOW — at/above fasting diagnostic threshold
        elif glucose >= 100:
            glucose_score = 0.15   # GREEN — prediabetes range

    combined_base = min(max(symptom_score, glucose_score), 1.0)

    amp_score, amp_matched = _apply_amplifiers(patient_data)
    total = min(combined_base + amp_score, 1.0)
    band = _band_for_score(total)

    contributing: dict[str, Any] = {"symptoms": symptoms, "amplifiers": amp_matched}
    if glucose is not None:
        contributing["self_reported_glucose"] = glucose

    return {
        "level": band["label"],
        "score": round(total, 3),
        "recommendation": band["recommendation"],
        "contributing": contributing,
    }
