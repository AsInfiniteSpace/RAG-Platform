from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RAG Platform"
    environment: str = "development"
    log_level: str = "INFO"
    
    openai_api_key: str
    llm_provider: str = "openai"
    embedding_provider: str = "openai"
    reranker_provider: str = "cohere"

    database_url: str = "postgresql+psycopg2://rag_user:rag_password@localhost:5432/rag_platform"

    redis_url: str = "redis://localhost:6379"
    
    jwt_secret: str = "change-this-to-a-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # tokens valid for 24 hours

    storage_path: str = "storage"

    

    cookie_name: str = "access_token"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    cookie_max_age: int = 60 * 60 * 24

    cohere_api_key: str = ""

    smtp_host: str
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str

    contact_email: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )
    

settings = Settings()

TIER_LIMITS = {
    "free": {"monthly_tokens": 50_000, "monthly_search_units": 500, "storage_mb": 100},
    "pro": {"monthly_tokens": 1_000_000, "monthly_search_units": 10_000, "storage_mb": 5_000},
}