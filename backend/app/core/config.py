from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Restaurant Discovery Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "gourmet_ai_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # PostgreSQL connection string (Homebrew default database)
    DATABASE_URL: str = "postgresql://localhost/ai_restaurant_db"
    
    # CORS Origins allowed
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # SMTP / Production Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "noreply@gourmetai.io"
    EMAILS_FROM_NAME: str = "GourmetAI"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        case_sensitive = True
        env_file = (".env", "backend/.env")
        extra = "ignore"

settings = Settings()



