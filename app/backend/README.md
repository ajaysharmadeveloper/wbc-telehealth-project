# WBC Telehealth Backend

FastAPI + LangGraph ReAct agent for diabetes pre-screening triage. Collects patient symptoms via chat, evaluates risk (GREEN / YELLOW / RED), and integrates with clinic workflows. This is **not** a diagnostic tool — it provides triage support only.

---

## Quick Start

```bash
# 1. Copy environment file and fill in your keys
cp .env.example .env

# 2. Start all services (Postgres, Redis, Backend)
docker compose up -d

# 3. Verify
curl http://localhost:8000/health
# → {"status":"ok","env":"development"}
```

Alembic migrations run automatically on startup — no manual migration step needed.

---

## Docker Services

| Container               | Image              | Port (host) | Purpose                  |
|-------------------------|--------------------|-------------|--------------------------|
| wbc-telehealth-backend  | python:3.11-slim   | 8000        | FastAPI + LangGraph agent|
| wbc-telehealth-postgres | postgres:16-alpine | 5433        | PostgreSQL database      |
| wbc-telehealth-redis    | redis:7-alpine     | 6379        | Session cache            |

### Commands

```bash
# Start all services
docker compose up -d

# Rebuild after code/dependency changes
docker compose up --build -d

# View logs
docker compose logs -f              # all services
docker compose logs -f backend      # backend only

# Stop all services
docker compose down

# Stop and remove volumes (fresh DB)
docker compose down -v
```

---

## URLs

| URL                              | Description            |
|----------------------------------|------------------------|
| http://localhost:8000/health     | Health check           |
| http://localhost:8000/docs       | Swagger UI (OpenAPI)   |
| http://localhost:8000/redoc      | ReDoc API docs         |
| http://localhost:8000/chat       | Chat endpoint (POST)   |
| http://localhost:8000/session/{id} | Session history (GET)|
| http://localhost:8000/admin/stats | Admin metrics (GET)   |

---

## API Endpoints

### POST /chat

Send a patient message through the triage agent.

```json
// Request
{
  "session_id": "optional-id",   // auto-generated if omitted
  "message": "I've been very thirsty and urinating frequently for a week"
}

// Response
{
  "session_id": "sess_abc123",
  "reply": "Based on your symptoms...",
  "risk_result": {
    "level": "YELLOW",
    "score": 0.55,
    "recommendation": "Book clinic appointment",
    "contributing": { "symptoms": ["polydipsia", "polyuria"], "amplifiers": [] }
  },
  "turn_count": 1
}
```

### GET /session/{session_id}

Retrieve full conversation history and patient data for a session.

### GET /admin/stats

Aggregate metrics: total sessions, total turns, triage distribution (GREEN/YELLOW/RED counts).

### GET /health

Returns `{"status": "ok", "env": "development"}`.

---

## Environment Variables

Configured via `.env` file (see `.env.example`):

| Variable              | Default                          | Description                         |
|-----------------------|----------------------------------|-------------------------------------|
| APP_ENV               | development                      | App environment                     |
| APP_HOST              | 0.0.0.0                         | Server bind host                    |
| APP_PORT              | 8000                             | Server bind port                    |
| LOG_LEVEL             | INFO                             | Python logging level                |
| OPENAI_API_KEY        | —                                | OpenAI API key (required for chat)  |
| OPENAI_MODEL          | gpt-4o-mini                      | LLM model name                      |
| PINECONE_API_KEY      | —                                | Pinecone API key (optional)         |
| PINECONE_INDEX_NAME   | telehealth-diabetes-kb           | Pinecone index name                 |
| PINECONE_ENVIRONMENT  | us-east-1                        | Pinecone region                     |
| DATABASE_URL          | postgresql+psycopg2://telehealth:telehealth$2026@postgres:5432/telehealth_db | PostgreSQL connection |
| REDIS_URL             | redis://redis:6379/0             | Redis connection                    |
| RULES_DIR             | /data/rules                      | Path to JSON rule files             |

> Inside Docker, use service names (`postgres`, `redis`) as hosts. For local access from your machine, use `localhost` with mapped ports (5433, 6379).

---

## Project Structure

```
app/backend/
├── src/                           # Application source code
│   ├── main.py                    # FastAPI app, CORS, startup migrations
│   ├── config/                    # Configuration & DB session
│   │   ├── __init__.py            # Settings class (pydantic-settings, loads .env)
│   │   └── session.py             # SQLAlchemy engine, SessionLocal, get_db, init_db
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── __init__.py            # Re-exports Base, Session, ConversationTurn
│   │   ├── session.py             # Session model (patient conversation state)
│   │   └── conversation.py        # ConversationTurn model + Base class
│   ├── api/                       # FastAPI route handlers
│   │   ├── chat.py                # POST /chat — runs one agent turn
│   │   ├── session.py             # GET /session/{id} — conversation history
│   │   └── admin.py               # GET /admin/stats — dashboard metrics
│   ├── agent/                     # LangGraph ReAct agent
│   │   ├── graph.py               # Graph assembly: agent → tools ⟲ → guardrail → save
│   │   ├── state.py               # AgentState TypedDict (session_id, messages, patient_data, risk_result, turn_count)
│   │   ├── nodes/                 # Graph node implementations
│   │   │   ├── agent_node.py      # LLM reasoning — decides which tool to call or final response
│   │   │   ├── tools_node.py      # Executes tool calls, returns results back to agent
│   │   │   ├── guardrail_node.py  # Scrubs diagnosis language, appends disclaimer, escalates risk
│   │   │   └── save_node.py       # Persists turn to PostgreSQL + refreshes Redis cache
│   │   ├── tools/                 # Agent tool implementations
│   │   │   ├── extract_symptoms.py       # Parse free-text → structured symptoms, age, duration, severity
│   │   │   ├── detect_emergency.py       # Flag RED-level emergencies (keywords, glucose thresholds)
│   │   │   ├── calculate_risk_score.py   # Hybrid rule engine → GREEN/YELLOW/RED with score 0.0–1.0
│   │   │   ├── check_completeness.py     # Validate all required patient fields are present
│   │   │   ├── book_appointment.py       # Mock appointment booking (MVP)
│   │   │   └── search_medical_knowledge.py  # RAG lookup via Pinecone (fallback: ADA 2026 snippet)
│   │   └── prompts/
│   │       └── system_prompt.py   # Agent system prompt — triage role, tool usage, disclaimers
│   ├── rag/
│   │   └── client.py              # Pinecone vector DB client (with graceful fallback)
│   ├── rules/
│   │   └── loader.py              # Loads JSON rule files from RULES_DIR
│   └── services/
│       └── session_cache.py       # Redis session cache wrapper (1-hour TTL)
│
├── tests/                         # Test suite
│   ├── conftest.py                # Pytest config, adds src/ to sys.path
│   ├── test_graph_flow.py         # End-to-end graph smoke test (mocked LLM)
│   ├── test_guardrail.py          # Disclaimer append + diagnosis scrubbing
│   └── test_tools/                # Unit tests for each agent tool
│       ├── test_extract_symptoms.py
│       ├── test_detect_emergency.py
│       ├── test_calculate_risk_score.py
│       ├── test_check_completeness.py
│       └── test_book_appointment.py
│
├── alembic/                       # Database migrations
│   ├── env.py                     # Migration env (reads settings + models)
│   └── versions/
│       └── 20260411_0001_initial_schema.py  # Creates sessions + conversation_turns tables
│
├── docker-data/                   # Persistent Docker data (gitignored)
│   ├── postgres/                  # PostgreSQL data files
│   └── redis/                     # Redis dump files
│
├── Dockerfile                     # Backend container (python:3.11-slim)
├── docker-compose.yml             # Orchestrates postgres, redis, backend
├── alembic.ini                    # Alembic config (points to env.py)
├── requirements.txt               # Python dependencies
├── postman_collection.json        # Postman API collection for testing
├── .env                           # Local environment variables (gitignored)
├── .env.example                   # Environment variable template
└── .gitignore
```

---

## Agent Flow

```
START → agent_node → [tools_node ⟲ agent_node] → guardrail_node → save_node → END
```

1. **agent_node** — LLM with tool bindings. Reasons about patient input, decides to call a tool or produce final response.
2. **tools_node** — Executes the selected tool, returns result back to agent (loops until LLM produces a final response).
3. **guardrail_node** — Scrubs diagnosis claims, appends medical disclaimer, can escalate risk level (never downgrade).
4. **save_node** — Persists conversation turn to PostgreSQL and refreshes Redis cache.

### Agent Tools

| Tool                        | Purpose                                                   |
|-----------------------------|-----------------------------------------------------------|
| `extract_symptoms`          | Parse patient text → structured symptoms, age, duration   |
| `detect_emergency`          | Flag RED-level emergencies (keywords, glucose levels)     |
| `calculate_risk_score`      | Hybrid rule engine → GREEN / YELLOW / RED                 |
| `check_completeness`        | Validate required patient fields are present              |
| `book_appointment`          | Mock appointment booking (MVP)                            |
| `search_medical_knowledge`  | RAG lookup from Pinecone or fallback knowledge base       |

### Risk Levels

| Level  | Score Range | Action                     |
|--------|-------------|----------------------------|
| GREEN  | 0.0 – 0.3  | Self-care guidance          |
| YELLOW | 0.3 – 0.7  | Book clinic appointment     |
| RED    | 0.7 – 1.0  | Seek urgent/emergency care  |

---

## Database

**PostgreSQL 16** with two tables:

### sessions
| Column       | Type        | Notes                              |
|--------------|-------------|------------------------------------|
| id           | VARCHAR(64) | Primary key                        |
| user_id      | VARCHAR(64) | Indexed                            |
| patient_data | JSON        | Accumulated symptom data           |
| risk_result  | JSON        | Latest triage result (nullable)    |
| turn_count   | INTEGER     | Number of conversation turns       |
| created_at   | DATETIME    | Session creation time              |
| updated_at   | DATETIME    | Last update (auto)                 |

### conversation_turns
| Column     | Type        | Notes                                |
|------------|-------------|--------------------------------------|
| id         | INTEGER     | Auto-increment primary key           |
| session_id | VARCHAR(64) | FK → sessions.id (CASCADE delete)    |
| role       | VARCHAR(16) | "user", "assistant", or "tool"       |
| content    | TEXT        | Message content                      |
| tool_name  | VARCHAR(64) | Tool name if role="tool" (nullable)  |
| meta       | JSON        | Extra metadata (nullable)            |
| created_at | DATETIME    | Turn creation time                   |

### Migration Commands

```bash
# Migrations run automatically on backend startup. For manual control:

# Apply all migrations
docker compose exec backend alembic upgrade head

# Create a new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Downgrade one step
docker compose exec backend alembic downgrade -1
```

---

## Database Access

```bash
# Connect from host machine
psql "postgresql://telehealth:telehealth\$2026@localhost:5433/telehealth_db"

# Connect from inside the backend container
docker compose exec backend python -c "
from src.config.session import SessionLocal
db = SessionLocal()
print(db.execute('SELECT count(*) FROM sessions').scalar())
db.close()
"
```

---

## Testing

```bash
# Run tests inside the container
docker compose exec backend pytest -v

# Run specific test file
docker compose exec backend pytest tests/test_tools/test_extract_symptoms.py -v

# Run locally (requires src/ on PYTHONPATH)
cd app/backend && PYTHONPATH=. pytest -v
```

### Test Coverage

| Test File                    | What it tests                                     |
|------------------------------|---------------------------------------------------|
| test_extract_symptoms.py     | Keyword detection, age/duration/severity parsing   |
| test_detect_emergency.py     | Red keywords, glucose thresholds, combinations     |
| test_calculate_risk_score.py | GREEN/YELLOW/RED scoring with amplifiers           |
| test_check_completeness.py   | Required field validation                          |
| test_book_appointment.py     | Mock booking returns confirmed slot                |
| test_graph_flow.py           | End-to-end graph routing (mocked LLM)             |
| test_guardrail.py            | Disclaimer append, diagnosis language scrubbing    |

---

## Dependencies

| Package            | Version | Purpose                         |
|--------------------|---------|---------------------------------|
| fastapi            | 0.115.0 | Web framework                   |
| uvicorn            | 0.30.6  | ASGI server                     |
| pydantic           | 2.9.2   | Data validation                 |
| pydantic-settings  | 2.5.2   | Environment config              |
| langgraph          | 0.2.34  | Agent graph orchestration       |
| langchain          | 0.3.3   | LLM framework                   |
| langchain-openai   | 0.2.2   | OpenAI LLM integration          |
| openai             | 1.51.0  | OpenAI API client               |
| sqlalchemy         | 2.0.35  | ORM                             |
| psycopg2-binary    | 2.9.9   | PostgreSQL driver               |
| alembic            | 1.13.3  | Database migrations             |
| redis              | 5.1.1   | Redis client                    |
| pinecone-client    | 5.0.1   | Vector DB for RAG               |
| pytest             | 8.3.3   | Testing framework               |
| httpx              | 0.27.2  | HTTP client for test requests   |
