from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websockets.connection_manager import manager
from app.models.sensor import GasSensorReading
import json
import asyncio # Import asyncio to demonstrate a slight delay if needed for debugging
from datetime import datetime
from typing import Optional
import random


router = APIRouter(
    prefix="/ws",
    tags=["WebSockets"]
)

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for bidirectional communication.
    Clients can connect and receive real-time sensor data updates,
    and also send commands to the server.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Listen for incoming messages from the WebSocket client
            # This allows bidirectional communication: client can send data/commands
            data = await websocket.receive_text()
            print(f"Received message from client {websocket.client}: {data}")

            # Example: Process incoming client messages (e.g., request specific data)
            try:
                message_json = json.loads(data)
                if message_json.get("type") == "request_data":
                    await manager.send_personal_message(f"Server received request: {message_json.get('payload')}", websocket)
                elif message_json.get("type") == "command":
                    await manager.send_personal_message(f"Server received command: {message_json.get('payload')}", websocket)
                else:
                    await manager.send_personal_message(f"Server received: {data}", websocket)
            except json.JSONDecodeError:
                await manager.send_personal_message(f"Server received plain text: {data}", websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {websocket.client} disconnected from WebSocket.")
    except Exception as e:
        print(f"WebSocket error for client {websocket.client}: {e}")
        manager.disconnect(websocket)

# Helper function to push new sensor readings to connected WebSocket clients
async def push_sensor_reading_to_websockets(reading: GasSensorReading):
    """
    Pushes a new sensor reading to all connected WebSocket clients.
    This function will be called from the FastAPI POST endpoint after a successful write.
    """
    print("DEBUG: Entered push_sensor_reading_to_websockets function.") # ADD THIS DEBUG PRINT
    try:
        # Pydantic v2.11.5 uses .model_dump()
        message_dict = reading.model_dump(mode='json')
        
        message = json.dumps(message_dict)
        
        # Adding a small delay to ensure the event loop has time to process if needed
        # await asyncio.sleep(0.1) # UNCOMMENT FOR ADDITIONAL DEBUGGING IF STILL NO BROADCAST

        await manager.broadcast(message)
        print(f"Broadcasted new reading to {len(manager.active_connections)} clients.")
    except Exception as e:
        print(f"Error broadcasting sensor reading via WebSocket: {e}")
        import traceback
        traceback.print_exc() # Print full traceback for detailed error

#Function to generate mock sensor data(kept)
def generate_mock_reading(sensor_id: str, gas_type: str) -> GasSensorReading:
    """Generate a mock GasSensorReading."""
    value = round(random.uniform(20.0, 100.0), 2)
    return GasSensorReading(
        sensor_id=sensor_id,
        gas_type=gas_type,
        value=value,
        timestamp=datetime.utcnow()
    )
    
# websocket endpoint for continuous mock data streaming (kept and will be visualized )
@router.websocket("/mock_stream")
async def mock_stream_endpoint(
    websocket: WebSocket,
    sensor_id: str = Query("mock_sensor_01", description="Sensor ID for mock data"),
    gas_type: str = Query("CO2", description="Gas type for mock data"),
    interval_ms: int = Query(1000, ge= 50, description="Interva; between data points in milliseconds")

):
    """
    websocket endpoint for continuous streaming of mock sensor data.
    Generates and sends data at specified intervals.
    """
    await websocket.accept()
    print(f"Mock streaming Websocket connection established: {websocket.client}")
    await websocket.send_text(json.dumps({"type": "info", "message": f"Starting mock stream for {sensor_id}/{gas_type} at {interval_ms}ms intervals."}))

    try:
        while True:
            mock_reading = generate_mock_reading(sensor_id, gas_type)
            message_dict = mock_reading.model_dump(mode='json')

            await websocket.send_text(json.dumps({
                "type": "mock_data",
                "data": message_dict
            }))
            print(f"Sent mock data to {websocket.client}: {mock_reading.value}")
            await asyncio.sleep(interval_ms / 1000.0)
    except WebSocketDisconnect:
        print(f"Client {websocket.client} disconnected from mock stream.")
    except Exception as e:
        print(f"Error in mock streaming endpoint for client {websocket.client}: {e}")
        import traceback
        traceback.print_exc()
        await websocket.close(code=1011, reason=f"Server error: {e}")  