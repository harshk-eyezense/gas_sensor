
Gas Sensor Monitoring & Live Stream Dashboard
This project is a full-stack application designed for real-time monitoring of sensor data (gas and acoustic) and live YouTube streams. It features a FastAPI backend for data ingestion, processing, and API exposure, a unified InfluxDB backend for time-series data storage, and a dynamic web frontend for visualization.

Table of Contents
Project Overview

Key Features

Backend Architecture

Technologies Used

Project Structure

Setup Instructions

Prerequisites

Backend Setup

InfluxDB Setup

YouTube Data API Key

How to Run

API Endpoints

Frontend Usage

Project Overview
This application serves as a prototype for an IoT monitoring system. It demonstrates how to build a robust backend using FastAPI to handle various data streams, store them efficiently in InfluxDB, and provide real-time and historical data access to a web-based dashboard.

Initially, the project involved separate AWS Lambda functions for different data types (DynamoDB for acoustic, Timestream for gas sensor, YouTube API for streams). This project consolidates all sensor data storage to InfluxDB, simplifying the database architecture while retaining the original functionalities.

Key Features
Real-time Gas Sensor Data:

Generates mock gas sensor readings and streams them live via WebSockets.

Persistently stores all real-time gas sensor data into InfluxDB.

Displays live gas sensor data on the frontend with a "worm chart" visualization.

Acoustic Sensor Data Management:

Provides an API endpoint for ingesting acoustic waveform data (simulating data from a microphone).

Stores high-resolution acoustic data points in InfluxDB, including precise timestamping for each sample within a batch.

Offers an API endpoint to query historical acoustic data from InfluxDB for waveform visualization.

YouTube Live Stream Lookup:

Integrates with the YouTube Data API to resolve channel handles and find active live video IDs.

Provides an API endpoint to retrieve live stream URLs for predefined devices.

Unified InfluxDB Backend: All sensor data (gas and acoustic) is now managed exclusively within InfluxDB, simplifying data storage and querying.

Interactive Web Dashboard: A single-page application (HTML/CSS/JS) provides a dashboard interface with:

Sidebar navigation for different devices and data types.

Dynamic content loading for gas sensor charts, acoustic waveforms, and embedded YouTube videos.

Editable input fields for device IDs and sensor types to facilitate testing with various data streams.

Backend Architecture
The backend is built with FastAPI, a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.

API Endpoints: RESTful endpoints for data ingestion, querying, and external service interaction (YouTube).

WebSockets: Dedicated endpoints for real-time data streaming to the frontend.

InfluxDB Integration: Uses the influxdb-client Python library to seamlessly write and query time-series data.

Configuration Management: Uses pydantic-settings to load sensitive information (API keys, database credentials) from a .env file.

Modular Design: The application is structured into routers (app/routers/) for better organization and maintainability.

Technologies Used
Backend:

Python 3.9+

FastAPI

Uvicorn (ASGI server)

InfluxDB Client (Python)

Pydantic & Pydantic-Settings

httpx (for asynchronous HTTP requests)

asyncio (for concurrent operations)

pytz (for timezone-aware datetimes)

Database:

InfluxDB (Time-Series Database)

Flux (InfluxDB's query language)

Frontend:

HTML5

CSS3 (TailwindCSS for utility-first styling)

JavaScript

ApexCharts.js (for interactive data visualization)

Font Awesome (for icons)

Development Tools:

pip (Python package manager)

venv (Python virtual environments)

Project Structure
your_project_root/
├── .env                              # Environment variables (InfluxDB, YouTube API keys)
├── requirements.txt                  # Python dependencies
├── app/                              # FastAPI application source code
│   ├── __init__.py                   # Makes 'app' a Python package
│   ├── config/                       # Configuration module
│   │   ├── __init__.py
│   │   └── config.py                 # Loads settings from .env
│   ├── models/                       # Pydantic data models
│   │   ├── __init__.py
│   │   ├── sensor.py                 # Gas sensor data model
│   │   └── acoustic.py               # Acoustic sensor data model
│   ├── core/                         # Core functionalities (DB client, utilities)
│   │   ├── __init__.py
│   │   └── influxdb_client.py        # InfluxDB client management, read/write functions
│   ├── websockets/                   # WebSocket related code
│   │   ├── __init__.py
│   │   ├── connection_manager.py     # Manages WebSocket connections
│   │   └── ws_routes.py              # WebSocket endpoints (mock stream, real-time push)
│   ├── routers/                      # API endpoint definitions
│   │   ├── __init__.py
│   │   ├── sensor_routes.py          # Placeholder for general sensor API (can be expanded)
│   │   ├── youtube_stream_router.py  # YouTube live stream lookup endpoint
│   │   └── influxdb_query_router.py  # InfluxDB query endpoint for gas sensor data
│   │   └── acoustic_router.py        # InfluxDB query/ingestion endpoints for acoustic data
│   └── main.py                       # Main FastAPI application entry point
└── dashboard.html                    # Frontend dashboard HTML file

Setup Instructions
Prerequisites
Python 3.9+ installed on your system.

InfluxDB 2.x installed and running. You can download it from InfluxData.

Ensure your InfluxDB instance is accessible (default: http://localhost:8086).

Create an Organization, a Bucket (e.g., gas_sensor), and a Token with read/write permissions for that bucket.

Google Cloud Project & YouTube Data API v3 Key:

Go to Google Cloud Console.

Create a new project.

Enable the "YouTube Data API v3" for your project.

Create API credentials (an API Key).

Backend Setup
Clone the repository (or create the project structure manually as described above).

Navigate to your project's root directory in the terminal.

Create a Python virtual environment:

python -m venv venv

Activate the virtual environment:

On Windows: .\venv\Scripts\activate

On macOS/Linux: source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Configure Environment Variables:

Create a .env file in the root directory of your project (same level as app/ and requirements.txt).

Populate it with your InfluxDB and YouTube API credentials:

INFLUXDB_URL="http://localhost:8086"
INFLUXDB_TOKEN="YOUR_INFLUXDB_TOKEN"
INFLUXDB_ORG="your-org"
INFLUXDB_BUCKET="gas_sensor"

YOUTUBE_API_KEY="YOUR_YOUTUBE_API_KEY_HERE"

Replace the placeholder values with your actual credentials.

InfluxDB Setup
Ensure your InfluxDB 2.x instance is running. You can typically start it via its executable or a service. Verify it's accessible at the INFLUXDB_URL specified in your .env.

YouTube Data API Key
Make sure you have obtained a valid YouTube Data API v3 key and placed it in your .env file. Without it, the YouTube live stream lookup functionality will not work.

How to Run
Activate your virtual environment (if not already active).

Start the FastAPI application:

uvicorn app.main:app --reload

The --reload flag is useful during development as it automatically restarts the server on code changes.

You should see output indicating the server is running, typically at http://127.0.0.1:8000.

API Endpoints
Once the FastAPI server is running, you can access the interactive API documentation (Swagger UI) at:
http://127.0.0.1:8000/docs

Here are the main endpoints:

Gas Sensor Data (InfluxDB)

POST /readings/: Ingests a new gas sensor reading (also broadcast via WebSocket).

GET /influxdb_query/get_sensor_records: Queries historical gas sensor data from InfluxDB.

Acoustic Sensor Data (InfluxDB)

POST /acoustic/readings/: Ingests a batch of acoustic sensor readings.

GET /acoustic/query_records: Queries historical acoustic sensor data from InfluxDB.

YouTube Stream Management

GET /youtube/get_live_streams: Retrieves live stream URLs for configured devices.

WebSockets (for real-time streaming)

ws /ws/mock_stream: WebSocket endpoint for mock gas sensor data streaming.

ws /ws/: General WebSocket endpoint for real-time updates (used for broadcasting data from POST /readings/).

Frontend Usage
Open dashboard.html in your web browser. This file is located at the root of your project.

Navigate the Sidebar:

Click on "Stationary" to expand its subsections.

Select "Acoustic" to view the acoustic waveform section.

Select "Chemical" to view the gas sensor waveform section.

Select "Video" to view the YouTube live stream section.

Interact with Sections:

Acoustic/Chemical: Use the editable "Device ID" and "Sensor Type" input fields to specify which data to load. Click "Load Data" to fetch historical data from InfluxDB. For Chemical, you can also "Start Live Stream" to see real-time mock data via WebSocket.

Video: Click "Load Live Stream" to embed the YouTube video for the specified channel.

Observe:

Charts will update dynamically.

Raw data messages will appear below the charts.

Check your FastAPI server's terminal for logs related to data ingestion and queries.

Verify data persistence by checking your InfluxDB UI (usually http://localhost:8086) after sending data.
