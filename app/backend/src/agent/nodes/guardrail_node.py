"""Guardrail Node — safety & disclaimer enforcement.

Runs AFTER the Agent Node produces its final assistant response (no tool
calls). It:

1. Appends the mandatory disclaimer if missing.
2. Scrubs any language that sounds like a diagnosis.
3. Allows an emergency override — score can only move UP (never down).
"""
from __future__ import annotations

import re
from typing import Any

from langchain_core.messages import AIMessage

from ..state import AgentState


DISCLAIMER = (
    "\n\n— This is triage support only, not medical advice. "
    "Please consult a qualified clinician for any health decisions."
)

_DIAGNOSIS_PATTERNS = [
    (re.compile(r"\byou have (?:type\s*[12]\s*)?diabetes\b", re.I),
     "your symptoms may be consistent with diabetes-related concerns"),
    (re.compile(r"\byou are diabetic\b", re.I),
     "your symptoms raise concerns worth evaluating"),
    (re.compile(r"\bi diagnose\b", re.I), "based on what you've shared"),
    (re.compile(r"\bdefinitely\b", re.I), "possibly"),
]


def _scrub(text: str) -> str:
    for pattern, replacement in _DIAGNOSIS_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def _escalate_risk(current: dict[str, Any] | None, emergency_override: str | None) -> dict[str, Any] | None:
    """Emergency detection can only escalate the risk level UP (RED > YELLOW > GREEN)."""
    order = {"GREEN": 0, "YELLOW": 1, "RED": 2}
    if emergency_override is None:
        return current
    if current is None:
        return {"level": emergency_override, "score": 1.0, "recommendation": "Seek urgent medical care",
                "contributing": {"emergency_override": True}}
    cur_level = current.get("level", "GREEN")
    if order.get(emergency_override, 0) > order.get(cur_level, 0):
        return {**current, "level": emergency_override, "score": 1.0,
                "recommendation": "Seek urgent medical care",
                "contributing": {**current.get("contributing", {}), "emergency_override": True}}
    return current


def guardrail_node(state: AgentState) -> dict:
    messages = state.get("messages", [])
    if not messages:
        return {}
    last = messages[-1]
    if not isinstance(last, AIMessage):
        return {}

    # Scrub + disclaimer
    cleaned = _scrub(last.content or "")
    if DISCLAIMER.strip() not in cleaned:
        cleaned = cleaned.rstrip() + DISCLAIMER

    # Emergency escalation: tools_node already normalizes detect_emergency
    # results into standard risk_result format with level/score/recommendation.
    # Here we just ensure the risk can only go UP, never down.
    risk_result = state.get("risk_result")
    emergency_override = None
    if risk_result and isinstance(risk_result, dict):
        contrib = risk_result.get("contributing", {})
        if contrib.get("emergency_override"):
            emergency_override = "RED"
    updated_risk = _escalate_risk(risk_result, emergency_override)

    new_msg = AIMessage(content=cleaned, id=getattr(last, "id", None))
    return {"messages": [new_msg], "risk_result": updated_risk}
