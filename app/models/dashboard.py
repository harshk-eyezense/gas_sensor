from pydantic import BaseModel
from typing import List, Optional

class SensorSummary(BaseModel):
    """Pydantic model for a single sensor type summary."""
    type: str
    active: int
    atRisk: int
    offline: int

class RecentAlert(BaseModel):
    """Pydantic model for a recent alert entry."""
    type: str
    name: str
    time: str
    resolved: bool
    description: str

class DashboardDataResponse(BaseModel):
    """Pydantic model for the dashboard data API response."""
    status: bool
    message: str
    data: List[SensorSummary]

class AlertsResponse(BaseModel):
    """Pydantic model for the recent alerts API response."""
    status: bool
    message: str
    data: List[RecentAlert]
