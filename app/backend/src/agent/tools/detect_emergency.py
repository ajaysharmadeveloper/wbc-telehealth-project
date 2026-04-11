"""Tool: detect_emergency — keyword + threshold scan for RED-level escalation."""
from __future__ import annotations

import re
from typing import Any

from langchain_core.tools import tool

from ...rules.loader import load_rules


_GLUCOSE_RE = re.compile(
    r"(?:blood\s*sugar|glucose|bg)\s*(?:is|was|at|of|=)?\s*(\d{2,4})",
    re.I,
)


def _scan_numeric(text: str, low: int, high: int) -> tuple[bool, str | None]:
    for m in _GLUCOSE_RE.finditer(text):
        try:
            val = int(m.group(1))
        except ValueError:
            continue
        if val >= high:
            return True, f"Self-reported blood glucose {val} mg/dL >= {high}"
        if val <= low:
            return True, f"Self-reported blood glucose {val} mg/dL <= {low}"
    return False, None


@tool
def detect_emergency(text: str) -> dict[str, Any]:
    """Flag red-level emergency conditions in patient input.

    Returns {emergency: bool, reasons: [...], triage_override: 'RED'|None}.
    """
    cfg = load_rules()["emergency"]
    text_l = text.lower()
    reasons: list[str] = []

    for kw in cfg.get("red_keywords", []):
        if kw.lower() in text_l:
            reasons.append(f"keyword: {kw}")

    for combo in cfg.get("red_symptom_combinations", []):
        if all(token.lower() in text_l for token in combo):
            reasons.append("combination: " + " + ".join(combo))

    numeric_cfg = cfg.get("self_reported_numeric_red", {})
    low = numeric_cfg.get("blood_glucose_mg_dl_low", 60)
    high = numeric_cfg.get("blood_glucose_mg_dl_high", 300)
    hit, detail = _scan_numeric(text, low, high)
    if hit and detail:
        reasons.append(detail)

    is_emergency = bool(reasons)
    return {
        "emergency": is_emergency,
        "reasons": reasons,
        "triage_override": "RED" if is_emergency else None,
    }
