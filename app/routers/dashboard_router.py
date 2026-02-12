from fastapi import APIRouter
from app.models.dashboard import DashboardDataResponse, AlertsResponse, SensorSummary, RecentAlert
from typing import List, Optional

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

# Mock data for sensor summary
MOCK_SENSOR_SUMMARY = [
    SensorSummary(type='Chemical Sensors', active=4, atRisk=2, offline=1),
    SensorSummary(type='Video Sensors', active=5, atRisk=3, offline=4),
    SensorSummary(type='Audio Sensors', active=4, atRisk=2, offline=3),
]




@router.get("/sensor_summary", response_model=DashboardDataResponse)
async def get_sensor_summary():
    """Returns a summary of sensor statuses for the dashboard."""
    return DashboardDataResponse(
        status=True,
        message="Successfully retrieved sensor summary data.",
        data=MOCK_SENSOR_SUMMARY
    )

