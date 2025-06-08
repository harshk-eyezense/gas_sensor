from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.connection_manager import manager
from app.models.sensor import GasSensorReading
import json
import asyncio # Import asyncio to demonstrate a slight delay if needed for debugging

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
