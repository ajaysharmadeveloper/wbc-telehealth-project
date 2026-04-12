"""Tool: book_appointment — mock slot generator for the MVP."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from langchain_core.tools import tool


def _generate_slots(n: int = 3) -> list[dict[str, str]]:
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    return [
        {
            "slot_id": f"slot-{i}",
            "start": (now + timedelta(days=i + 1, hours=9)).isoformat() + "Z",
            "doctor": "Dr. Triage (MVP mock)",
        }
        for i in range(n)
    ]


@tool
def book_appointment(
    patient_name: str | None = None,
    preferred_day: str | None = None,
) -> dict[str, Any]:
    """Return available clinic slots and confirm a booking (mock).

    In the MVP the tool just generates the next three weekday slots and
    confirms the first one as booked.
    """
    slots = _generate_slots()
    booked = slots[0]
    return {
        "status": "confirmed",
        "patient_name": patient_name or "Patient",
        "preferred_day": preferred_day,
        "booked_slot": booked,
        "alternatives": slots[1:],
        "notice": "This is a mock booking for the MVP — no external calendar was updated.",
    }
