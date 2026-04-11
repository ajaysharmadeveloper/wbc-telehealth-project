"""Application settings loaded from environment variables."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    # LLM
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Pinecone (optional for MVP smoke run)
    pinecone_api_key: str = ""
    pinecone_index_name: str = "telehealth-diabetes-kb"
    pinecone_environment: str = "us-east-1"

    # Database
    database_url: str = "postgresql+psycopg2://triage:triage@localhost:5432/triage"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Data paths — default resolves to <repo>/data/rules relative to this file
    rules_dir: str = str(
        (Path(__file__).resolve().parents[3] / "data" / "rules")
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
