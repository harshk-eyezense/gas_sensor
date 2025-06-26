from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class GasSensorReading(BaseModel):
    """
    Pydantic model for a gas sensor reading.
    """
    sensor_id: str = Field(..., description="Unique identifier for the sensor.")
    gas_type: str = Field(..., description="Type of gas detected (e.g., CO, CH4, LPG).")
    value: float = Field(..., description="Measured gas concentration or level.")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of the reading. If not provided, server current time will be used.")

    class Config:
        json_schema_extra = {
            "example": {
                "sensor_id": "sensor_001",
                "gas_type": "CO",
                "value": 50.7,
                "timestamp": "2025-06-07T10:30:00.123456+00:00"
            }
        }

class GasSensorQuery(BaseModel):
    """
    Pydantic model for querying gas sensor readings.
    """
    sensor_id: Optional[str] = Field(None, description="Filter by unique identifier for the sensor.")
    gas_type: Optional[str] = Field(None, description="Filter by type of gas detected.")
    start_time: Optional[datetime] = Field(None, description="Start timestamp for the query range.")
    end_time: Optional[datetime] = Field(None, description="End timestamp for the query range.")
    limit: int = Field(100, ge=1, description="Maximum number of records to return.")
    sort_desc: bool = Field(True, description="Sort results in descending order by time if True, ascending otherwise.")

    class Config:
        json_schema_extra = {
            "example": {
                "sensor_id": "sensor_001",
                "gas_type": "CO",
                "start_time": "2025-06-07T00:00:00+00:00",
                "end_time": "2025-06-07T23:59:59+00:00",
                "limit": 50,
                "sort_desc": True
            }
        }

class GasSensorDelete(BaseModel):
    """
    Pydantic model for deleting gas sensor readings.
    """
    sensor_id: Optional[str] = Field(None, description="Filter by unique identifier for the sensor.")
    gas_type: Optional[str] = Field(None, description="Filter by type of gas detected.")
    start_time: datetime = Field(..., description="Start timestamp for the deletion range.")
    end_time: datetime = Field(..., description="End timestamp for the deletion range.")

    class Config:
        json_schema_extra = {
            "example": {
                "sensor_id": "sensor_001",
                "gas_type": "CO",
                "start_time": "2025-06-07T00:00:00+00:00",
                "end_time": "2025-06-07T23:59:59+00:00"
            }
        }
class GasSensorReading(BaseModel):
    """
    Pydantic model for a single gas sensor reading.
    """
    sensor_id: str = Field(..., description="Unique identifier for the sensor.")
    gas_type: str = Field(..., description="The type of gas being detected (e.g., CO2, Methane, VOC).")
    value: float = Field(..., description="Sensor reading value.")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the reading.")
    