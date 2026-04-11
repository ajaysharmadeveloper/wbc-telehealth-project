"""Tool: check_completeness — verify required patient fields are present."""
from __future__ import annotations

from typing import Any

from langchain_core.tools import tool

from ...rules.loader import load_rules


@tool
def check_completeness(patient_data: dict[str, Any]) -> dict[str, Any]:
    """Return {complete: bool, missing: [str]} based on required_patient_fields."""
    required = load_rules()["thresholds"]["required_patient_fields"]
    missing = [
        field for field in required
        if not patient_data.get(field)
    ]
    return {"complete": len(missing) == 0, "missing": missing}
