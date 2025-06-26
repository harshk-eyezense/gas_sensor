from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any

from app.core.influxdb_client import write_acoustic_reading, query_acoustic_readings
from app.models.acoustic import AcousticSensorReading # Import the new model

router = APIRouter(
    prefix="/acoustic",
    tags=["Acoustic Sensor Data"]
)

# Response model for acoustic data queries
class AcousticQueryRecord(BaseModel):
    device_id: str = Field(..., description="Unique identifier for the device.")
    sensor_type: str = Field(..., description="Type of acoustic sensor.")
    timestamp: str = Field(..., description="ISO 8601 timestamp of the reading.")
    value: float = Field(..., description="Acoustic reading value.")

class AcousticQueryResponse(BaseModel):
    status: bool
    message: str
    data: list[AcousticQueryRecord]
    record_count: int


@router.post("/readings/", response_model=AcousticSensorReading, status_code=201)
async def create_acoustic_reading(reading: AcousticSensorReading):
    """
    Ingest a new batch of acoustic sensor readings into InfluxDB.
    Each value in 'sensor_readings' will be stored as a separate InfluxDB point,
    with a precise timestamp derived from the base_timestamp and sampling_rate_hz.
    """
    try:
        write_acoustic_reading(
            device_id=reading.device_id,
            sensor_type=reading.sensor_type,
            readings=reading.sensor_readings,
            base_timestamp=reading.timestamp,
            sampling_rate_hz=reading.sampling_rate_hz
        )
        print(f"Successfully wrote {len(reading.sensor_readings)} acoustic data points to InfluxDB for device {reading.device_id}.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write acoustic sensor reading to InfluxDB: {e}"
        ) from e
    
    return reading # Return the ingested reading (useful for confirmation)


@router.get("/query_records", response_model=AcousticQueryResponse)
async def get_acoustic_records(
    device_id: str = Query(..., description="Device ID to query data for."),
    sensor_type: str = Query(..., description="Acoustic sensor type (e.g., 'microphone')."),
    from_time: Optional[datetime] = Query(None, description="Start timestamp (ISO 8601 format, e.g., '2025-05-27T22:20:16Z')."),
    to_time: Optional[datetime] = Query(None, description="End timestamp (ISO 8601 format)."),
    limit: int = Query(1000, ge=1, description="Maximum number of individual acoustic data points to retrieve."),
):
    """
    Retrieves acoustic sensor records (individual data points) from InfluxDB.
    """
    try:
        records = await query_acoustic_readings(
            device_id=device_id,
            sensor_type=sensor_type,
            start_time=from_time,
            end_time=to_time,
            limit=limit
        )
        return AcousticQueryResponse(
            status=True,
            message="success",
            data=records,
            record_count=len(records)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve or process acoustic sensor records: {str(e)}"
        )

