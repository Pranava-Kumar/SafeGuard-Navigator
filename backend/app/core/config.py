from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "SafeRoute Backend"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "Backend services for SafeRoute - AI-Driven Public Safety Navigation System"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "safetrouterroute"
    POSTGRES_PASSWORD: str = "safetrouterroute"
    POSTGRES_DB: str = "safetrouterroute"
    DATABASE_URL: Optional[str] = None
    
    # JWT
    SECRET_KEY: str = "safetrouterroute_secret_key_for_development_only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Security
    PASSWORD_MIN_LENGTH: int = 8
    
    # OSRM
    OSRM_HOST: str = "localhost"
    OSRM_PORT: int = 5000
    
    # API Keys for data sources
    NASA_API_KEY: Optional[str] = None
    MAPPLS_API_KEY: Optional[str] = None
    IMD_API_KEY: Optional[str] = None
    
    # Override DATABASE_URL if not set or if it's invalid
    @property
    def database_url(self) -> str:
        # Check if DATABASE_URL is set and valid
        if self.DATABASE_URL and not self.DATABASE_URL.startswith("file:"):
            return self.DATABASE_URL
        # For development, use SQLite
        return "sqlite:///./safetrouterroute.db"
    
    class Config:
        env_file = ".env"


settings = Settings()