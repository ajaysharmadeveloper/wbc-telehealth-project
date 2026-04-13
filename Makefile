# ============================================================================
# WBC Telehealth Project — Root Makefile
# Run all commands from the project root directory.
# ============================================================================

COMPOSE_FILE := app/backend/docker-compose.yml
BACKEND_DIR  := app/backend
FRONTEND_DIR := app/frontend
WEBSITE_DIR  := website

# ── Docker / Infrastructure ─────────────────────────────────────────────────

.PHONY: up
up: ## Start all services (postgres, redis, backend)
	docker compose -f $(COMPOSE_FILE) up -d

.PHONY: up-build
up-build: ## Rebuild and start all services
	docker compose -f $(COMPOSE_FILE) up -d --build

.PHONY: down
down: ## Stop all services
	docker compose -f $(COMPOSE_FILE) down

.PHONY: restart
restart: ## Restart all services
	docker compose -f $(COMPOSE_FILE) restart

.PHONY: logs
logs: ## Tail backend logs
	docker logs -f wbc-telehealth-backend

.PHONY: logs-all
logs-all: ## Tail all service logs
	docker compose -f $(COMPOSE_FILE) logs -f

.PHONY: ps
ps: ## Show running containers
	docker compose -f $(COMPOSE_FILE) ps

.PHONY: clean
clean: ## Stop services and remove volumes
	docker compose -f $(COMPOSE_FILE) down -v
	rm -rf $(BACKEND_DIR)/docker-data

# ── Backend ─────────────────────────────────────────────────────────────────

.PHONY: backend-shell
backend-shell: ## Open shell inside backend container
	docker compose -f $(COMPOSE_FILE) exec backend bash

.PHONY: backend-rebuild
backend-rebuild: ## Rebuild only the backend container
	docker compose -f $(COMPOSE_FILE) up -d --build backend

.PHONY: health
health: ## Check backend health endpoint
	@curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health

# ── Database / Migrations ───────────────────────────────────────────────────

.PHONY: db-migrate
db-migrate: ## Run alembic migrations to latest
	docker compose -f $(COMPOSE_FILE) exec backend alembic upgrade head

.PHONY: db-revision
db-revision: ## Create a new alembic migration (use: make db-revision msg="description")
	docker compose -f $(COMPOSE_FILE) exec backend alembic revision --autogenerate -m "$(msg)"

.PHONY: db-downgrade
db-downgrade: ## Downgrade one migration step
	docker compose -f $(COMPOSE_FILE) exec backend alembic downgrade -1

.PHONY: db-history
db-history: ## Show migration history
	docker compose -f $(COMPOSE_FILE) exec backend alembic history

.PHONY: db-shell
db-shell: ## Open psql shell to the database
	docker compose -f $(COMPOSE_FILE) exec postgres psql -U telehealth -d telehealth_db

.PHONY: db-reset
db-reset: ## Drop all data and re-run migrations (DESTRUCTIVE)
	docker compose -f $(COMPOSE_FILE) exec postgres psql -U telehealth -d telehealth_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	docker compose -f $(COMPOSE_FILE) exec backend alembic upgrade head

# ── Pinecone / Knowledge Base ──────────────────────────────────────────────

.PHONY: kb-ingest
kb-ingest: ## Ingest knowledge base into Pinecone (requires PINECONE_API_KEY in .env)
	docker compose -f $(COMPOSE_FILE) exec backend python -m src.rag.ingest

.PHONY: kb-ingest-local
kb-ingest-local: ## Ingest from local path (for development outside Docker)
	cd $(BACKEND_DIR) && python -m src.rag.ingest --data-dir ../../data/knowledge

# ── Tests ───────────────────────────────────────────────────────────────────

.PHONY: test
test: ## Run backend tests
	docker compose -f $(COMPOSE_FILE) exec backend pytest tests/ -v

.PHONY: test-tools
test-tools: ## Run only tool tests
	docker compose -f $(COMPOSE_FILE) exec backend pytest tests/test_tools/ -v

.PHONY: eval
eval: ## Run agent evaluation (all 22 questions, saves report + DB sessions)
	docker compose -f $(COMPOSE_FILE) exec backend python -m tests.test_agent_eval

.PHONY: eval-emergency
eval-emergency: ## Eval only emergency + hard questions
	docker compose -f $(COMPOSE_FILE) exec backend python -m tests.test_agent_eval --only emergency hard

.PHONY: eval-tricky
eval-tricky: ## Eval only tricky + adversarial questions
	docker compose -f $(COMPOSE_FILE) exec backend python -m tests.test_agent_eval --only tricky adversarial

.PHONY: eval-easy
eval-easy: ## Eval only easy + medium questions
	docker compose -f $(COMPOSE_FILE) exec backend python -m tests.test_agent_eval --only easy medium

.PHONY: eval-report
eval-report: ## Show the latest eval report summary
	@docker compose -f $(COMPOSE_FILE) exec backend python -c "import json; r=json.load(open('tests/agent_eval_report.json')); s=r['summary']; print(f\"Passed: {s['passed']}/{s['total']} ({s['accuracy_pct']}%) | Failed: {s['failed']} | Errors: {s['errors']} | Avg: {s['avg_duration_sec']}s\")"

.PHONY: eval-sessions
eval-sessions: ## List all eval sessions from Postgres
	docker compose -f $(COMPOSE_FILE) exec postgres psql -U telehealth -d telehealth_db -c "SELECT id, turn_count, risk_result->>'level' as risk, created_at FROM sessions WHERE id LIKE 'eval_%' ORDER BY created_at DESC;"

.PHONY: eval-clean
eval-clean: ## Delete all eval sessions from Postgres
	docker compose -f $(COMPOSE_FILE) exec postgres psql -U telehealth -d telehealth_db -c "DELETE FROM sessions WHERE id LIKE 'eval_%';"

# ── Frontend (Next.js Chat UI) ──────────────────────────────────────────────

.PHONY: frontend-install
frontend-install: ## Install frontend dependencies
	cd $(FRONTEND_DIR) && npm install

.PHONY: frontend-dev
frontend-dev: ## Start frontend dev server
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: frontend-build
frontend-build: ## Build frontend for production
	cd $(FRONTEND_DIR) && npm run build

# ── Website (Landing Page) ──────────────────────────────────────────────────

.PHONY: website-install
website-install: ## Install website dependencies
	cd $(WEBSITE_DIR) && npm install

.PHONY: website-dev
website-dev: ## Start website dev server (port 5173)
	cd $(WEBSITE_DIR) && npm run dev

.PHONY: website-build
website-build: ## Build website for production
	cd $(WEBSITE_DIR) && npm run build

# ── Setup (first-time) ─────────────────────────────────────────────────────

.PHONY: setup
setup: ## First-time project setup: build containers + run migrations
	@echo "Building Docker images..."
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo ""
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@echo ""
	@echo "Running migrations..."
	docker compose -f $(COMPOSE_FILE) exec backend alembic upgrade head
	@echo ""
	@echo "Setup complete! Backend: http://localhost:8000/docs"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Set PINECONE_API_KEY in $(BACKEND_DIR)/.env"
	@echo "  2. Run: make kb-ingest"
	@echo "  3. Test: make health"

# ── Help ────────────────────────────────────────────────────────────────────

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
