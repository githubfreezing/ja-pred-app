# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List

class Settings(BaseSettings):
    api_v1_str: str = "/api/v1"
    project_name: str = "MyApp"

    backend_cors_origins: List[AnyHttpUrl] = []

    # ★ DATABASE_URL を追加（.env から読み込まれる）
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/appdb"
    AI_SERVICE_URL: str

    JWT_SECRET_KEY: str = "CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    
    # ★ Pydantic Settings v2 正しい設定
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()