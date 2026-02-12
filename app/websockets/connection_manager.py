# from fastapi import WebSocket, WebSocketDisconnect
# from typing import List, Dict

# class ConnectionManager:
#     """
#     Manages active WebSocket connections, allowing broadcasting and individual messaging.
#     """
#     def __init__(self):
#         # Stores active WebSocket connections.
#         # Could be extended to store connections by user_id or sensor_id if needed.
#         self.active_connections: list[WebSocket] = []
#         print("ConnectionManager initialized.")

#     async def connect(self, websocket: WebSocket):
#         """
#         Accepts a new WebSocket connection and adds it to the list of active connections.
#         """
#         await websocket.accept()
#         self.active_connections.append(websocket)
#         print(f"New WebSocket connection established: {websocket.client}")

#     def disconnect(self, websocket: WebSocket):
#         """
#         Removes a WebSocket connection from the list of active connections.
#         """
#         self.active_connections.remove(websocket)
#         print(f"WebSocket connection disconnected: {websocket.client}")

#     async def send_personal_message(self, message: str, websocket: WebSocket):
#         """
#         Sends a message to a specific WebSocket client.
#         """
#         try:
#             await websocket.send_text(message)
#             print(f"Sent message to {websocket.client}: {message}")
#         except Exception as e:
#             print(f"Error sending message to {websocket.client}: {e}")
#             # Consider disconnecting if sending fails repeatedly
#             self.disconnect(websocket)

#     async def broadcast(self, message: str):
#         """
#         Broadcasts a message to all active WebSocket clients.
#         """
#         disconnected_clients = []
#         for connection in self.active_connections:
#             try:
#                 await connection.send_text(message)
#             except WebSocketDisconnect:
#                 print(f"Client {connection.client} disconnected during broadcast.")
#                 disconnected_clients.append(connection)
#             except Exception as e:
#                 print(f"Error broadcasting to {connection.client}: {e}")
#                 disconnected_clients.append(connection)
        
#         # Remove disconnected clients after iterating
#         for client in disconnected_clients:
#             self.active_connections.remove(client)
        
#         if disconnected_clients:
#             print(f"Removed {len(disconnected_clients)} disconnected clients during broadcast.")

# manager = ConnectionManager()
from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

