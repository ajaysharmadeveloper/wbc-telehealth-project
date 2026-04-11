# Alembic Migrations

This directory holds the database migration history for the Telehealth Triage
backend. Migrations are run against the database configured by
`DATABASE_URL` in `app/backend/.env`.

## Common commands

Run from `app/backend/`:

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration from model changes
alembic revision --autogenerate -m "short description"

# Roll the last migration back
alembic downgrade -1

# Show current DB revision
alembic current

# Show migration history
alembic history --verbose
```

## Layout

- `alembic.ini` — config file at the backend root
- `alembic/env.py` — bootstraps the URL and `target_metadata` from
  `src.config.settings` and `src.db.models.Base`
- `alembic/versions/` — one file per migration, applied in order
