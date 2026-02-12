# from fastapi import FastAPI, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# from app.routers import sensor_routes
# from app.websockets import ws_routes
# from app.routers import youtube_stream_router
# from app.routers import influxdb_query_router
# from app.routers import acoustic_router
# from app.core.influxdb_client import close_influxdb_client, write_sensor_reading # Import write_sensor_reading directly
# from app.websockets.ws_routes import push_sensor_reading_to_websockets
# from app.models.sensor import GasSensorReading
# import asyncio

# app = FastAPI(
#     title="Gas Sensor Monitoring API",
#     description="API for managing and real-time monitoring of gas sensor readings using FastAPI and InfluxDB with WebSockets.",
#     version="1.0.0",
# )

# # Configure CORS to allow all origins for development.
# # In production, restrict this to your frontend's domain.
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allows all origins
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
#     allow_headers=["*"],  # Allows all headers
# )

# # Include the API router for sensor readings
# # NOTE: sensor_routes.py no longer contains the POST /readings/ route
# app.include_router(sensor_routes.router)

# # Include the WebSocket router
# app.include_router(ws_routes.router)
# app.include_router(youtube_stream_router.router) # YouTube stream lookup
# app.include_router(influxdb_query_router.router)
# app.include_router(acoustic_router.router)
# @app.on_event("startup")
# async def startup_event():
#     """
#     Event handler for application startup.
#     Can be used for initial database connections or other setup tasks.
#     """
#     print("Application startup: InfluxDB client initialized (if .env is set).")

# @app.on_event("shutdown")
# async def shutdown_event():
#     """
#     Event handler for application shutdown.
#     Ensures InfluxDB client connection is closed gracefully.
#     """
#     close_influxdb_client()
#     print("Application shutdown: InfluxDB client closed.")

# # This POST endpoint in main.py will now handle both
# # writing to InfluxDB AND broadcasting via WebSocket.
# @app.post("/readings/", response_model=GasSensorReading, status_code=201)
# async def create_sensor_reading_and_broadcast(reading: GasSensorReading):
#     """
#     Ingest a new gas sensor reading into InfluxDB and broadcast it to all connected WebSockets.
#     """
#     print("DEBUG: create_sensor_reading_and_broadcast hit.")

#     # Call write_sensor_reading directly from app.core.influxdb_client
#     # Note: write_sensor_reading is not async, so no 'await' needed directly on it,
#     # but it's fine within an async function.
#     try:
#         write_sensor_reading(
#             sensor_id=reading.sensor_id,
#             gas_type=reading.gas_type,
#             value=reading.value,
#             timestamp=reading.timestamp
#         )
#         print("Successfully wrote data point (from main.py override).")
#     except Exception as e:
#         # Re-raise as HTTPException for FastAPI to handle and return 500
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to write sensor reading to InfluxDB: {e}"
#         ) from e # Use 'from e' for clearer traceback chaining


#     # Immediately push the new reading to all connected WebSocket clients
#     asyncio.create_task(push_sensor_reading_to_websockets(reading)) # Pass the original 'reading' object
#     print("DEBUG: asyncio.create_task for WebSocket broadcast initiated.")

#     # Return the reading that was successfully processed
#     return reading

# @app.get("/")
# async def root():
#     """
#     Root endpoint to confirm the API is running.
#     """
#     return {"message": "Welcome to Gas Sensor Monitoring API! Go to /docs for API documentation."}

#updated codE
import time
import os
from fastapi import FastAPI, Request,WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.routers import influxdb_query_router, acoustic_router, youtube_stream_router, sensors_router, dashboard_router, alerts_router


app = FastAPI(
    title="Sensor Fusion API",
    description="A FastAPI backend for a sensor monitoring and live streaming dashboard.",
    version="1.0.0",
)

#Set up CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(influxdb_query_router.router)
app.include_router(acoustic_router.router)
app.include_router(youtube_stream_router.router)
app.include_router(sensors_router.router)
app.include_router(dashboard_router.router)
app.include_router(alerts_router.router)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    if request.scope["type"] == "websocket":
        return await call_next(request)
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Sensor Fusion API"}

@app.websocket("/ws/test")
async def ws_test(ws: WebSocket):
    await ws.accept()
    await ws.send_text("connected")
