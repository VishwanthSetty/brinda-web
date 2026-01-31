"""
Application Configuration
Manages environment variables and application settings using Pydantic Settings
"""

from functools import lru_cache
from typing import List
import os
from urllib.parse import quote_plus

from pydantic import model_validator
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
    jwt_expire_minutes: int = 7200
    
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
    
    # SMTP Email Configuration
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    contact_recipient_email: str = os.getenv("CONTACT_RECIPIENT_EMAIL", "brindapublications@gmail.com")

    # Webhook Configuration
    webhook_secret: str = os.getenv("WEBHOOK_SECRET", "")

    @model_validator(mode='after')
    def _update_mongodb_url(self) -> 'Settings':
        """
        Constructs a safe MongoDB URL with escaped credentials if provided
        and updates the mongodb_url field.
        """
        if self.mongodb_user and self.mongodb_password:
             safe_user = quote_plus(self.mongodb_user)
             safe_pass = quote_plus(self.mongodb_password)
             
             # Default to "mongodb" service name if using docker compose default
             # Use the host from existing URL if possible (e.g., mongodb://mongodb:27017 -> mongodb:27017)
             original_url = self.mongodb_url
             if "@" in original_url:
                 # Strip existing credentials if present
                 _, host_part = original_url.split("@", 1)
             else:
                 # Remove scheme
                 host_part = original_url.replace("mongodb://", "")
                 # If it was just "mongodb://localhost:27017"
            
             # Append authSource=admin for root credentials
             separator = "?" if "?" not in host_part else "&"
             self.mongodb_url = f"mongodb://{safe_user}:{safe_pass}@{host_part}{separator}authSource=admin"

        return self

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
