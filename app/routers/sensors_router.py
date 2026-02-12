from typing import List, Optional
from fastapi import APIRouter, WebSocket,WebSocketDisconnect
from app.models.sensor_list import SensorData, SensorListResponse

router = APIRouter(
    prefix="/sensors",
    tags=["Sensors"]
)
@router.websocket("/ws/mock_stream")
async def mock_sensor_stream(
    websocket: WebSocket,
):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({
                "sensor_id": "mock_sensor_01",
                "gas_type": "CO2",
                "value": round(400 + 50 * asyncio.get_running_loop().time() % 10, 2)
            })
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
# Mock data to get the frontend working
MOCK_CHEMICAL_SENSORS = [
    SensorData(name='Device A', status='Active', stream='N/A', location='Houston, USA'),
    SensorData(name='Device B', status='Offline', stream='N/A', location='Arizona, USA'),
    SensorData(name='Device C', status='Active', stream='N/A', location='Vancouver, Canada'),
    SensorData(name='Device D', status='Active', stream='N/A', location='Lima, Peru'),
]

MOCK_ACOUSTIC_SENSORS = [
    SensorData(name='Mic 1', status='Active', stream='N/A', location='Berlin, Germany'),
    SensorData(name='Mic 2', status='Offline', stream='N/A', location='Tokyo, Japan'),
]

MOCK_VIDEO_SENSORS = [
    SensorData(name='Camera 1', status='Active', stream='N/A', location='New York, USA'),
    SensorData(name='Camera 2', status='Offline', stream='N/A', location='London, UK'),
]


@router.get("/chemical", response_model=SensorListResponse)
async def get_chemical_sensors():
    """Returns a list of chemical sensors."""
    return SensorListResponse(
        status=True,
        message="Successfully retrieved chemical sensor data.",
        data=MOCK_CHEMICAL_SENSORS
    )

@router.get("/acoustic", response_model=SensorListResponse)
async def get_acoustic_sensors():
    """Returns a list of acoustic sensors."""
    return SensorListResponse(
        status=True,
        message="Successfully retrieved acoustic sensor data.",
        data=MOCK_ACOUSTIC_SENSORS
    )

@router.get("/video", response_model=SensorListResponse)
async def get_video_sensors():
    """Returns a list of video sensors."""
    return SensorListResponse(
        status=True,
        message="Successfully retrieved video sensor data.",
        data=MOCK_VIDEO_SENSORS
    )
