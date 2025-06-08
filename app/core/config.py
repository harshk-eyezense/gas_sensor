import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """
    Application settings loaded from environment variables.
    """
    INFLUXDB_URL: str = os.getenv("INFLUXDB_URL", "http://localhost:8086")
    INFLUXDB_TOKEN: str = os.getenv("INFLUXDB_TOKEN", "") # IMPORTANT: Replace with your actual token
    INFLUXDB_ORG: str = os.getenv("INFLUXDB_ORG", "your_organization") # IMPORTANT: Replace with your actual org
    INFLUXDB_BUCKET: str = os.getenv("INFLUXDB_BUCKET", "sensor_data") # IMPORTANT: Replace with your actual bucket

settings = Settings()
