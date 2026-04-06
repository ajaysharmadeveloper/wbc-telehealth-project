# Telehealth Triage AI Assistant (Diabetes Focus)

An AI-driven triage system that helps small clinics pre-screen patients for diabetes-related conditions. It acts as a first-level digital assistant — collecting symptoms via chat, evaluating risk, and suggesting next steps (self-care, clinic appointment, or emergency care).

> **Disclaimer:** This is a triage support tool, not a diagnostic system. All recommendations require human clinical oversight.

## Architecture

```
[ Website (React+Vite) / App (Next.js) ]
        |
[ Chat Interface ]
        |
[ Input Processing Layer ]
  - Session Manager
  - Validation & Normalization
        |
[ AI Triage Engine ]
  - Symptom Extraction (LLM)
  - Risk Scoring (Rules + AI)
        |
[ Guardrail Layer ]
  - Emergency Detection
  - Safety Rules & Disclaimers
        |
[ Decision Engine ] --> [ Clinic Integration APIs ]
        |
[ Response Generator ]
```

## Tech Stack

| Layer          | Technology                              |
|----------------|----------------------------------------|
| Backend        | FastAPI, Pydantic                      |
| AI / Agent     | LangGraph, OpenAI APIs, RAG + Pinecone |
| Website        | React, Vite, Tailwind CSS              |
| App Frontend   | Next.js, React, Tailwind CSS           |
| Infrastructure | Docker, Redis, PostgreSQL              |

## Repository Structure

```
/website            Showcase / landing page (React + Vite)
/app/frontend       AI Assistant chat UI + admin dashboard
/app/backend        Core APIs + AI agent
/docs               Project specs and documentation
/data               Datasets, knowledge base research, rule definitions
```

## AI Agent (LangGraph ReAct)

The core AI uses a ReAct (Reason + Act) pattern built with LangGraph:

```
Agent Node (LLM reasons + picks tool)
    ↓ tool call?
Tools Node (executes tool) ──→ loops back to Agent
    ↓ final answer?
Guardrail Node (safety + disclaimers)
    ↓
Save Node (persist to PostgreSQL)
```

**6 tools**: extract_symptoms, check_completeness, calculate_risk_score, search_medical_knowledge, detect_emergency, book_appointment

## MVP Scope (Phase 1)

- Chat interface for symptom intake
- Diabetes-focused symptom collection
- LangGraph ReAct agent with hybrid risk scoring (green / yellow / red)
- Safety guardrails with emergency detection
- Static recommendations and mock booking system

## Getting Started

_Setup instructions will be added as the project is scaffolded._

## License

See [LICENSE](LICENSE) for details.
