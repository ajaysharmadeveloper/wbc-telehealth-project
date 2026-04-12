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
| Database       | PostgreSQL 16                          |
| Cache          | Redis 7                                |
| Infrastructure | Docker, Docker Compose                 |

## Repository Structure

```
/website              Showcase / landing page (React + Vite)
/app/frontend         AI Assistant chat UI + admin dashboard (Next.js/React)
/app/backend          Core APIs + AI agent (FastAPI/Python) — see app/backend/README.md
/docs                 Project specs and documentation
/data                 Datasets, knowledge base, rule definitions
  /data/rules         JSON rule files (symptom mappings, emergency keywords, thresholds)
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- OpenAI API key

### 1. Backend (API + Database + Cache)

```bash
cd app/backend

# Configure environment
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY

# Start all services
docker compose up -d
```

This starts three containers:

| Container               | Port  | Service               |
|-------------------------|-------|-----------------------|
| wbc-telehealth-backend  | 8000  | FastAPI + AI agent    |
| wbc-telehealth-postgres | 5433  | PostgreSQL 16         |
| wbc-telehealth-redis    | 6379  | Redis 7               |

Database migrations run automatically on startup.

**API URLs:**
- Health check: http://localhost:8000/health
- Swagger docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 2. Website (Landing Page)

```bash
cd website
npm install
npm run dev
# → http://localhost:5173/
```

### 3. App Frontend (Chat UI + Admin)

```bash
cd app/frontend
npm install
npm run dev
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
Save Node (persist to PostgreSQL + Redis)
```

### Tools

| Tool                        | Purpose                                              |
|-----------------------------|------------------------------------------------------|
| `extract_symptoms`          | Parse patient text → structured symptoms, age, etc.  |
| `check_completeness`        | Validate required patient fields are present         |
| `calculate_risk_score`      | Hybrid rule engine → GREEN / YELLOW / RED            |
| `search_medical_knowledge`  | RAG lookup from Pinecone or fallback KB              |
| `detect_emergency`          | Flag RED-level emergencies                           |
| `book_appointment`          | Mock appointment booking (MVP)                       |

### Risk Levels

| Level  | Score     | Action                    |
|--------|-----------|---------------------------|
| GREEN  | 0.0 – 0.3 | Self-care guidance        |
| YELLOW | 0.3 – 0.7 | Book clinic appointment   |
| RED    | 0.7 – 1.0 | Seek urgent/emergency care|

## API Endpoints

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| POST   | `/chat`             | Send message through triage agent    |
| GET    | `/session/{id}`     | Retrieve conversation history        |
| GET    | `/admin/stats`      | Dashboard metrics (sessions, triage) |
| GET    | `/health`           | Health check                         |

See `app/backend/README.md` for full API documentation with request/response examples.

## Docker Commands

```bash
cd app/backend

# Start all services
docker compose up -d

# Rebuild after changes
docker compose up --build -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Reset database (removes all data)
docker compose down -v
```

## Database Access

```bash
# Connect from host
psql "postgresql://telehealth:telehealth\$2026@localhost:5433/telehealth_db"
```

## Testing

```bash
# Run backend tests
docker compose exec backend pytest -v

# Run locally
cd app/backend && PYTHONPATH=. pytest -v
```

## Key Documents

- [Project Spec](docs/project/telehealth-triage-spec.md)
- [AI Agent Architecture](docs/backend/plan/2026-04-06/ai_agent_architecture_2026-04-06_13-20.md)
- [Website Landing Page Plan](docs/website/plan/2026-04-06/website_landing_page_plan_2026-04-06_13-27.md)
- [Knowledge Base Research](data/knowledge_base_research_2026-04-06_13-32.md)
- [Backend README](app/backend/README.md)

## MVP Scope (Phase 1)

- Chat interface for symptom intake
- Diabetes-focused symptom collection
- LangGraph ReAct agent with hybrid risk scoring (GREEN / YELLOW / RED)
- Safety guardrails with emergency detection
- Static recommendations and mock booking system

## License

See [LICENSE](LICENSE) for details.
