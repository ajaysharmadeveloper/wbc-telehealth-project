"""Application settings loaded from environment variables."""
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
    database_url: str = "postgresql+psycopg2://telehealth:telehealth$2026@postgres:5432/telehealth_db"

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # Data paths — set via RULES_DIR env var (Docker: /data/rules)
    rules_dir: str = "/data/rules"

    # Mem0
    mem0_enabled: bool = True

    # Telegram Bot
    telegram_bot_token: str = ""
    telegram_enabled: bool = False

    # Conversation context — dual threshold summarization
    context_token_limit: int = 2000
    context_max_raw_messages: int = 5

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
