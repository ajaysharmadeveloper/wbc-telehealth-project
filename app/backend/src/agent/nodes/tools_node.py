"""Tools Node — executes tools and merges results into AgentState fields.

Before execution, injects accumulated patient_data from state into tools
that need it (check_completeness, calculate_risk_score) so the LLM doesn't
have to reconstruct it from messages.

After execution, inspects ToolMessage results and updates state fields:
- extract_symptoms  → merges into patient_data
- calculate_risk_score → stores in risk_result
- detect_emergency (RED override) → stores in risk_result
"""
from __future__ import annotations

import copy
import json
from typing import Any

from langchain_core.messages import AIMessage, ToolMessage
from langgraph.prebuilt import ToolNode

from ..state import AgentState
from ..tools import ALL_TOOLS

_inner_tool_node = ToolNode(ALL_TOOLS)

# Tools that accept patient_data and should get it injected from state
_PATIENT_DATA_TOOLS = {"check_completeness", "calculate_risk_score"}


def tools_node(state: AgentState) -> dict[str, Any]:
    """Run tools with state injection, then merge results back into state."""
    patient_data = state.get("patient_data", {}) or {}

    # Inject patient_data into tool calls that need it
    patched_state = state
    messages = state.get("messages", [])
    if messages and patient_data:
        last = messages[-1]
        if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
            needs_patch = any(
                tc["name"] in _PATIENT_DATA_TOOLS for tc in last.tool_calls
            )
            if needs_patch:
                patched_calls = []
                for tc in last.tool_calls:
                    if tc["name"] in _PATIENT_DATA_TOOLS:
                        patched_args = {**tc["args"], "patient_data": patient_data}
                        patched_calls.append({**tc, "args": patched_args})
                    else:
                        patched_calls.append(tc)
                patched_msg = AIMessage(
                    content=last.content,
                    tool_calls=patched_calls,
                )
                patched_messages = list(messages[:-1]) + [patched_msg]
                patched_state = {**state, "messages": patched_messages}

    result = _inner_tool_node.invoke(patched_state)

    # ToolNode returns {"messages": [ToolMessage, ...]}
    tool_messages: list[ToolMessage] = result["messages"]
    updates: dict[str, Any] = {"messages": tool_messages}

    for msg in tool_messages:
        try:
            parsed = json.loads(msg.content)
        except (json.JSONDecodeError, TypeError):
            continue
        tool_name = msg.name

        if tool_name == "extract_symptoms":
            existing = state.get("patient_data", {}) or {}
            merged = {**existing}
            for key, value in parsed.items():
                if value is not None:
                    if key == "symptoms":
                        # Merge symptom lists (don't overwrite with subset)
                        old_symptoms = set(existing.get("symptoms", []))
                        new_symptoms = set(value) if value else set()
                        merged["symptoms"] = sorted(old_symptoms | new_symptoms)
                    else:
                        merged[key] = value
            updates["patient_data"] = merged

        elif tool_name == "calculate_risk_score":
            updates["risk_result"] = parsed

        elif tool_name == "detect_emergency":
            if parsed.get("triage_override") == "RED":
                # Normalize to standard risk_result format so all consumers
                # (guardrail, eval, API) can read risk_result["level"]
                updates["risk_result"] = {
                    "level": "RED",
                    "score": 1.0,
                    "recommendation": "Seek urgent medical care",
                    "contributing": {
                        "emergency_override": True,
                        "reasons": parsed.get("reasons", []),
                    },
                }

    return updates
