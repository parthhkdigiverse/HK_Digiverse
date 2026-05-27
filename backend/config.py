from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    frontend_port: int = 3000
    backend_port: int = 8000
    debug: bool = True
    app_name: str = "HariKrushn DigiVerse"
    
    # CORS Config (comma separated in .env if multiple)
    cors_origins: str = "*"

    # SMTP Config
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_to: str = "hkdigiverse@gmail.com"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
