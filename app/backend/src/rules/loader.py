"""Loads rule JSON files from the /data/rules directory.

Files are cached at process start. If you edit the JSON while the process is
running call ``reload_rules()`` to pick up changes.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from ..config import settings

RULE_FILES = {
    "symptom_risk":     "symptom_risk_mapping.json",
    "emergency":        "emergency_keywords.json",
    "thresholds":       "threshold_rules.json",
    "risk_amplifiers":  "risk_amplifiers.json",
}


def _load_one(name: str) -> dict:
    path = Path(settings.rules_dir) / name
    if not path.exists():
        raise FileNotFoundError(f"Rule file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_rules() -> dict[str, dict]:
    """Return all rule sets keyed by short name."""
    return {key: _load_one(fname) for key, fname in RULE_FILES.items()}


def reload_rules() -> dict[str, dict]:
    load_rules.cache_clear()
    return load_rules()
