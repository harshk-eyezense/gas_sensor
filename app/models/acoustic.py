from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class AcousticSensorReading(BaseModel):
    """
    Pydantic model for a batch of acoustic sensor readings.
    Each reading within 'sensor_readings' will be stored as a separate InfluxDB point.
    """
    device_id: str = Field(..., description="Unique identifier for the device.")
    sensor_type: str = Field(..., description="Type of acoustic sensor (e.g., 'microphone', 'vibration').")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the first reading in the batch.")
    sensor_readings: list[float] = Field(..., description="List of individual acoustic sensor reading values.")
    sampling_rate_hz: int = Field(..., description="Sampling rate in Hz for the sensor_readings (e.g., 4000).")

