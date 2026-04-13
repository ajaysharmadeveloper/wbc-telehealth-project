"""Agent evaluation test — runs real questions through the LangGraph agent and saves a report.

Each question gets its own fresh DB session so you can review the full
conversation (user message + tool calls + assistant reply) in Postgres.

Usage:
    # Inside Docker container (recommended):
    docker exec wbc-telehealth-backend python -m tests.test_agent_eval

    # Skip specific categories:
    docker exec wbc-telehealth-backend python -m tests.test_agent_eval --skip edge_case

    # Run only specific categories:
    docker exec wbc-telehealth-backend python -m tests.test_agent_eval --only emergency hard

Output: tests/agent_eval_report.json
Session IDs: all prefixed with "eval_" — query with:
    SELECT * FROM sessions WHERE id LIKE 'eval_%' ORDER BY created_at;
"""
from __future__ import annotations

import argparse
import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from src.agent.graph import build_graph
from src.config.session import SessionLocal
from src.models import ConversationTurn, Session as SessionModel


QUESTIONS_PATH = Path(__file__).parent / "agent_test_questions.json"
REPORT_PATH = Path(__file__).parent / "agent_eval_report.json"


def _role_of(msg) -> str:
    if isinstance(msg, HumanMessage):
        return "user"
    if isinstance(msg, AIMessage):
        return "assistant"
    if isinstance(msg, ToolMessage):
        return "tool"
    return "system"


def _save_session(session_id: str, messages: list, patient_data: dict, risk_result, turn_count: int):
    """Persist the eval session + all messages to Postgres."""
    db = SessionLocal()
    try:
        sess = SessionModel(id=session_id, user_id="eval_runner")
        sess.patient_data = patient_data
        sess.risk_result = risk_result
        sess.turn_count = turn_count
        db.add(sess)

        for msg in messages:
            db.add(ConversationTurn(
                session_id=session_id,
                role=_role_of(msg),
                content=getattr(msg, "content", "") or "",
                tool_name=(
                    getattr(msg, "name", None)
                    if isinstance(msg, ToolMessage)
                    else None
                ),
            ))
        db.commit()
    finally:
        db.close()


def run_single(graph, question: dict) -> dict:
    """Invoke the agent graph with a single question and capture the result."""
    msg = question["message"]

    # Skip completely empty strings — the graph needs at least something
    if not msg:
        return {
            **question,
            "reply": "[SKIPPED — empty input]",
            "actual_risk": None,
            "risk_match": question.get("expected_risk") == "GREEN",
            "error": None,
            "duration_sec": 0,
            "tools_called": [],
            "session_id": None,
        }

    session_id = f"eval_{uuid.uuid4().hex[:12]}"
    initial_messages = [HumanMessage(content=msg)]
    state = {
        "session_id": session_id,
        "messages": initial_messages,
        "patient_data": {},
        "risk_result": None,
        "turn_count": 0,
        "conversation_summary": "",
        "mem0_context": "",
    }

    start = time.time()
    error = None
    reply = ""
    actual_risk = None
    tools_called = []

    try:
        final = graph.invoke(state, config={"recursion_limit": 25})

        # Extract reply
        for m in reversed(final.get("messages", [])):
            if isinstance(m, AIMessage) and not getattr(m, "tool_calls", None):
                reply = m.content or ""
                break

        # Extract risk result
        risk = final.get("risk_result")
        if risk and isinstance(risk, dict):
            actual_risk = risk.get("level") or risk.get("risk_level")

        # Collect tool calls from message history
        for m in final.get("messages", []):
            if isinstance(m, AIMessage) and getattr(m, "tool_calls", None):
                for tc in m.tool_calls:
                    tools_called.append(tc.get("name", "unknown"))

        # Save the full conversation to Postgres
        all_messages = final.get("messages", [])
        _save_session(
            session_id,
            all_messages,
            final.get("patient_data", {}),
            risk,
            final.get("turn_count", 0),
        )

    except Exception as exc:
        error = str(exc)

    duration = round(time.time() - start, 2)
    expected = question.get("expected_risk")

    # Determine risk match
    risk_match = False
    if actual_risk and expected:
        risk_match = actual_risk.upper() == expected.upper()
    elif expected == "GREEN" and actual_risk is None:
        # No risk result typically means GREEN (no assessment triggered)
        risk_match = True

    return {
        "id": question["id"],
        "category": question["category"],
        "message": msg,
        "expected_risk": expected,
        "actual_risk": actual_risk,
        "risk_match": risk_match,
        "reply": reply[:500],
        "tools_called": tools_called,
        "error": error,
        "duration_sec": duration,
        "session_id": session_id,
        "notes": question.get("notes", ""),
    }


def build_summary(results: list[dict]) -> dict:
    """Compute aggregate stats from results."""
    total = len(results)
    passed = sum(1 for r in results if r["risk_match"])
    failed = sum(1 for r in results if not r["risk_match"] and not r["error"])
    errors = sum(1 for r in results if r["error"])
    avg_time = round(sum(r["duration_sec"] for r in results) / max(total, 1), 2)

    # Per-category breakdown
    categories: dict[str, dict] = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"total": 0, "passed": 0, "failed": 0, "errors": 0}
        categories[cat]["total"] += 1
        if r["error"]:
            categories[cat]["errors"] += 1
        elif r["risk_match"]:
            categories[cat]["passed"] += 1
        else:
            categories[cat]["failed"] += 1

    # Per-expected-risk breakdown
    by_risk: dict[str, dict] = {}
    for r in results:
        risk = r["expected_risk"] or "NONE"
        if risk not in by_risk:
            by_risk[risk] = {"total": 0, "passed": 0, "failed": 0}
        by_risk[risk]["total"] += 1
        if r["risk_match"]:
            by_risk[risk]["passed"] += 1
        else:
            by_risk[risk]["failed"] += 1

    return {
        "total": total,
        "passed": passed,
        "failed": failed,
        "errors": errors,
        "accuracy_pct": round((passed / max(total, 1)) * 100, 1),
        "avg_duration_sec": avg_time,
        "by_category": categories,
        "by_expected_risk": by_risk,
    }


def main():
    parser = argparse.ArgumentParser(description="Run agent evaluation")
    parser.add_argument("--skip", nargs="*", default=[], help="Categories to skip")
    parser.add_argument("--only", nargs="*", default=[], help="Only run these categories")
    args = parser.parse_args()

    questions = json.loads(QUESTIONS_PATH.read_text())

    # Filter by category
    if args.only:
        questions = [q for q in questions if q["category"] in args.only]
    elif args.skip:
        questions = [q for q in questions if q["category"] not in args.skip]

    print(f"\n{'='*60}")
    print(f"  Agent Evaluation — {len(questions)} questions")
    print(f"{'='*60}\n")

    # Build a fresh graph (no singleton — clean per eval)
    graph = build_graph()
    results = []

    for i, q in enumerate(questions, 1):
        label = f"[{i}/{len(questions)}] {q['id']} ({q['category']})"
        print(f"  {label} ...", end=" ", flush=True)
        result = run_single(graph, q)
        results.append(result)

        status = "PASS" if result["risk_match"] else ("ERROR" if result["error"] else "FAIL")
        risk_info = f"expected={result['expected_risk']} actual={result['actual_risk']}"
        print(f"{status}  {risk_info}  ({result['duration_sec']}s)")

    summary = build_summary(results)

    report = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "results": results,
    }

    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False))

    # Print summary
    print(f"\n{'='*60}")
    print(f"  RESULTS: {summary['passed']}/{summary['total']} passed ({summary['accuracy_pct']}%)")
    print(f"  Failed: {summary['failed']}  |  Errors: {summary['errors']}  |  Avg time: {summary['avg_duration_sec']}s")
    print(f"{'='*60}")
    print(f"\n  By Category:")
    for cat, stats in summary["by_category"].items():
        p, t = stats["passed"], stats["total"]
        print(f"    {cat:20s}  {p}/{t} passed")
    print(f"\n  By Expected Risk:")
    for risk, stats in summary["by_expected_risk"].items():
        p, t = stats["passed"], stats["total"]
        print(f"    {risk:10s}  {p}/{t} passed")
    print(f"\n  Report saved: {REPORT_PATH}\n")


if __name__ == "__main__":
    main()
