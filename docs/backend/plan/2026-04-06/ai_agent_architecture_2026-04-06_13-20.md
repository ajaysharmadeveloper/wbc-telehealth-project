# AI Agent Architecture — LangGraph ReAct Design

Created: 2026-04-06 13:20

---

## Overview

A ReAct (Reason + Act) AI agent built with LangGraph for diabetes triage. The agent reasons about patient input, decides which tools to call, observes results, and loops until it has enough data to produce a final triage recommendation.

Session is tied to logged-in user. Conversation history is stored in PostgreSQL.

---

## LangGraph Graph Structure

```
                    ┌─────────────────┐
                    │   START          │
                    │   (load session  │
                    │    history from  │
                    │    PostgreSQL)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   AGENT NODE    │◄──────────────┐
                    │                 │               │
                    │  LLM + System   │               │
                    │  Prompt +       │               │
                    │  Tool Bindings  │               │
                    │                 │               │
                    │  Decides:       │               │
                    │  tool_call or   │               │
                    │  final_response │               │
                    └───┬─────────┬───┘               │
                        │         │                   │
                  (tool_call) (final_response)        │
                        │         │                   │
                        ▼         │                   │
               ┌──────────────┐   │                   │
               │  TOOLS NODE  │   │      (tool result │
               │              │   │       fed back)    │
               │  Executes    │───────────────────────┘
               │  the tool    │
               │  LLM chose   │
               └──────────────┘
                        │
                        │ (when final_response)
                        ▼
               ┌──────────────┐
               │  GUARDRAIL   │
               │  NODE        │
               │              │
               │  - No diagnosis claims
               │  - Add disclaimer
               │  - Emergency override
               │  - Override score UP only
               └───────┬──────┘
                        │
                        ▼
               ┌──────────────┐
               │  SAVE NODE   │
               │              │
               │  Save conversation
               │  turn to PostgreSQL
               └───────┬──────┘
                        │
                        ▼
                    ┌────────┐
                    │  END   │
                    └────────┘
```

**4 nodes, 1 conditional edge, 1 loop.**

---

## Conditional Edge (ReAct Loop)

```
AGENT NODE
    │
    ├── has tool_calls? ──YES──→ TOOLS NODE ──→ back to AGENT NODE
    │
    └── no tool_calls?  ──YES──→ GUARDRAIL NODE ──→ SAVE NODE ──→ END
```

The LLM inside the Agent Node decides which tools to call and when to stop. LangGraph handles the routing.

---

## Agent State Schema

```
AgentState {
    session_id:    str              ← user's session ID
    messages:      list[BaseMessage] ← full conversation (loaded from DB)
    patient_data:  dict             ← extracted structured data so far
    risk_result:   dict | None      ← GREEN/YELLOW/RED + score
    turn_count:    int              ← how many turns in this session
}
```

---

## Tools Bound to Agent Node

| Tool | Purpose |
|------|---------|
| `extract_symptoms` | Parse patient text → structured JSON (age, symptoms, duration, severity, diabetes indicators) |
| `check_completeness` | Validate if critical fields are present. Returns: complete or list of missing fields |
| `calculate_risk_score` | Rule engine: apply medical thresholds. Output: GREEN/YELLOW/RED + confidence score |
| `search_medical_knowledge` | RAG lookup via Pinecone for diabetes-specific guidance and context |
| `detect_emergency` | Keyword + pattern matching to flag critical conditions immediately |
| `book_appointment` | Returns available slots, books a slot for the patient (mock for MVP) |

---

## Node Details

### 1. Agent Node
- Receives: current state (messages + patient_data)
- LLM with system prompt defining the triage assistant role
- All 6 tools bound via LangGraph tool binding
- Decides: call a tool OR produce final response

### 2. Tools Node
- Executes whichever tool(s) the Agent Node selected
- Returns tool result back to Agent Node for next reasoning step

### 3. Guardrail Node
- Runs AFTER Agent produces final response
- Enforces: no diagnosis claims, mandatory disclaimer, safety filters
- Emergency override: can escalate score upward (never downward)
- Modifies the final response if needed

### 4. Save Node
- Persists the full conversation turn (user message + agent response) to PostgreSQL
- Updates patient_data in DB for session continuity

---

## Example Flow

```
Patient: "I've been really thirsty and peeing a lot for 2 weeks"
    │
    ▼ AGENT thinks: "Need to extract symptoms first"
    → calls extract_symptoms tool
    → gets: {symptoms: [thirst, polyuria], duration: "2 weeks"}
    │
    ▼ AGENT thinks: "Missing age and severity"
    → calls check_completeness tool
    → gets: {missing: [age, severity]}
    │
    ▼ AGENT thinks: "Need to ask patient"
    → returns: "Can you tell me your age and how severe these symptoms feel?"
    │
Patient: "I'm 45, it's getting worse"
    │
    ▼ AGENT thinks: "Now I have enough, score the risk"
    → calls calculate_risk_score tool
    → gets: {level: YELLOW, score: 0.7}
    │
    ▼ AGENT thinks: "Should check for emergency flags"
    → calls detect_emergency tool
    → gets: {emergency: false}
    │
    ▼ AGENT thinks: "YELLOW = recommend appointment, final answer"
    → GUARDRAIL NODE → adds disclaimer → SAVE NODE → response to patient
```

---

## Session & Storage Model

- **Session**: Tied to authenticated user's login session ID
- **Conversation History**: Stored in PostgreSQL, loaded at START of each graph invocation
- **Patient Data**: Accumulated across turns, persisted in DB per session
- **Redis**: Used for session caching (fast lookups), PostgreSQL is source of truth

---

## Risk Scoring (Hybrid)

The `calculate_risk_score` tool uses a rule-based engine:
- Medical thresholds for diabetes indicators
- Known symptom-severity mappings from `/data` rules

The Agent Node's LLM provides contextual reasoning on top — combining rule output with conversational context to make the final triage decision.

Output levels:
- GREEN → self-care tips
- YELLOW → book clinic appointment
- RED → seek emergency care immediately
