"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "sras"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "uploads"
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
