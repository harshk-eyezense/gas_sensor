from pydantic import BaseModel
from typing import List, Optional

class SensorData(BaseModel):
    """Pydantic model for a single sensor entry."""
    name: str
    status: str
    stream: str
    location: str

class SensorListResponse(BaseModel):
    """Pydantic model for the API response containing a list of sensors."""
    status: bool
    message: str
    data: List[SensorData]
