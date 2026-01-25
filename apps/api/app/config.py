"""
Application Configuration
Manages environment variables and application settings using Pydantic Settings
"""

from functools import lru_cache
from typing import List
import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All settings can be overridden by environment variables.
    For example, MONGODB_URL environment variable overrides mongodb_url.
    """
    
    # MongoDB Configuration
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name: str = "brinda_web"
    mongodb_user: str = os.getenv("MONGODB_USER", "")
    mongodb_password: str = os.getenv("MONGODB_PASSWORD", "")
    
    # JWT Authentication
    jwt_secret: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # Application Settings
    environment: str = "development"
    debug: bool = True
    api_prefix: str = "/api"
    
    # CORS Settings
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Unolo External API
    unolo_id: str = os.getenv("UNOLO_ID", "")
    unolo_token: str = os.getenv("UNOLO_TOKEN", "")
    unolo_base_url: str = "https://api-lb-ext.unolo.com"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Uses lru_cache to ensure settings are only loaded once.
    """
    return Settings()
