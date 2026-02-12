from fastapi import APIRouter
from typing import List, Optional
from app.models.dashboard import AlertsResponse, RecentAlert

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

# Mock data for recent alerts
MOCK_RECENT_ALERTS = [
    RecentAlert(type='Chemical Sensors', name='Sensor 1', time='30 min ago', resolved=False, description='Small Description'),
    RecentAlert(type='Video Sensors', name='Alert 2', time='1h ago', resolved=False, description='Small Description'),
    RecentAlert(type='Chemical Sensors', name='Alert 3', time='2h 20m ago', resolved=True, description='Small Description'),
    RecentAlert(type='Audio Sensors', name='Alert 4', time='1d ago', resolved=True, description='Small Description'),
    RecentAlert(type='Audio Sensors', name='Alert 5', time='20h ago', resolved=True, description='Small Description'),
]

@router.get("/recent", response_model=AlertsResponse)
async def get_recent_alerts():
    """Returns a list of recent alerts for the dashboard."""
    return AlertsResponse(
        status=True,
        message="Successfully retrieved recent alerts data.",
        data=MOCK_RECENT_ALERTS
    )
