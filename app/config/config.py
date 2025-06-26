# This file is now located at app/config/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # YouTube API Key
    YOUTUBE_API_KEY: str

    # InfluxDB Settings
    INFLUXDB_URL: str
    INFLUXDB_TOKEN: str
    INFLUXDB_ORG: str
    INFLUXDB_BUCKET: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Create a settings instance that can be imported across your application
settings = Settings()