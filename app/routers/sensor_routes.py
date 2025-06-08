from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.sensor import GasSensorReading, GasSensorQuery, GasSensorDelete
from app.core.influxdb_client import write_sensor_reading, query_sensor_readings, delete_sensor_readings

router = APIRouter(
    prefix="/readings",
    tags=["Sensor Readings"]
)

# NOTE: The POST /readings/ route has been removed from here
# and is now defined directly in app/main.py to handle broadcasting.

@router.get("/", response_model=List[GasSensorReading])
async def get_sensor_readings(query: GasSensorQuery):
    """
    Retrieve gas sensor readings from InfluxDB based on various filters.
    """
    try:
        readings_data = await query_sensor_readings(
            sensor_id=query.sensor_id,
            gas_type=query.gas_type,
            start_time=query.start_time,
            end_time=query.end_time,
            limit=query.limit,
            sort_desc=query.sort_desc
        )
        # Convert dictionary results back to Pydantic models for response validation
        return [GasSensorReading(**data) for data in readings_data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query sensor readings: {e}"
        )

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_readings(delete_request: GasSensorDelete):
    """
    Delete gas sensor readings from InfluxDB within a specified time range and optional filters.
    Note: InfluxDB delete operations are range-based and filtered.
    Deleting specific single points is generally not how time-series databases are designed.
    """
    if not delete_request.start_time or not delete_request.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both start_time and end_time are required for deletion."
        )
    try:
        delete_sensor_readings(
            sensor_id=delete_request.sensor_id,
            gas_type=delete_request.gas_type,
            start_time=delete_request.start_time,
            end_time=delete_request.end_time
        )
        return {"message": "Delete operation initiated. Check InfluxDB for confirmation."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete sensor readings: {e}"
        )
