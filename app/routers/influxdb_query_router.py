from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.core.influxdb_client import query_and_process_influxdb_data # Import the InfluxDB query function

router = APIRouter(
    prefix="/influxdb_query",
    tags=["InfluxDB Data Query & Processing"]
)

class InfluxDBSensorRecord(BaseModel):
    sensor_id: str = Field(..., description="Unique identifier for the sensor.")
    gas_type: str = Field(..., description="Type of gas (maps to InfluxDB's 'gas_type' tag).")
    timestamp: str = Field(..., description="ISO 8601 timestamp of the reading.")
    value: float = Field(..., description="Sensor reading value.")

class InfluxDBQueryResponse(BaseModel):
    status: bool
    message: str
    data: List[InfluxDBSensorRecord]
    record_count: int

@router.get("/get_sensor_records", response_model=InfluxDBQueryResponse)
async def get_influxdb_sensor_records(
    sensor_id: str = Query(..., description="Sensor ID to query data for."),
    gas_type: str = Query(..., description="Gas type (e.g., 'CO2', 'Methane'). This maps to the 'gas_type' tag in InfluxDB."),
    from_time: Optional[datetime] = Query(None, description="Start timestamp (ISO 8601 format, e.g., '2025-05-27T22:20:16Z')."),
    to_time: Optional[datetime] = Query(None, description="End timestamp (ISO 8601 format)."),
    limit: int = Query(100, ge=1, description="Maximum number of records to retrieve."),
    # Removed `apply_downsampling` query param as complex logic (like trimmed_mean on value list)
    # is not directly applicable to single float values from InfluxDB unless aggregated.
    # For true time-series downsampling, Flux `aggregateWindow` is recommended within `query_and_process_influxdb_data`.
):
    """
    Retrieves and processes sensor records from InfluxDB.
    This endpoint combines functionalities previously found in DynamoDB/Timestream Lambdas.
    """
    try:
        records = await query_and_process_influxdb_data(
            sensor_id=sensor_id,
            gas_type=gas_type,
            start_time=from_time,
            end_time=to_time,
            limit=limit
        )
        return InfluxDBQueryResponse(
            status=True,
            message="success",
            data=records,
            record_count=len(records)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve or process InfluxDB sensor records: {str(e)}"
        )