import json
import re
from typing import Optional, Any
import httpx
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field

from app.config.config import settings

# Define the data structure for a single stream item
class DeviceStream(BaseModel):
    """Pydantic model for a single device stream entry."""
    deviceId: int
    deviceType: str
    channel: str
    streamingURL: str = ""
    source: str

# Define the response structure
class StreamResponse(BaseModel):
    """Pydantic model for the API response."""
    status: bool
    message: str
    data: list[DeviceStream]

# Initialize FastAPI router
router = APIRouter(
    prefix="/youtube",
    tags=["YouTube Stream Management"]
)

# Initial STATIC_STREAM_DATA. Ensure deviceId is unique.
# UPDATED: Added deviceId 5 with @qouteofday
STATIC_STREAM_DATA: list[dict[str, Any]] = [
    {
        "deviceId": 1,
        "deviceType": "turtleBot",
        "channel": "@travismendoza8939", # Example handle
        "streamingURL": "",
        "source": "youtube"
    },
    {
        "deviceId": 2,
        "deviceType": "djiDrone",
        "channel": "@redredsquirrel", # Example handle
        "streamingURL": "",
        "source": "youtube"
    },
    {
        "deviceId": 3,
        "deviceType": "go2Pro",
        "channel": "UC-channel-id-example", # Example UC-style channel ID
        "streamingURL": "",
        "source": "youtube"
    },
    {
        "deviceId": 4,
        "deviceType": "dronganFly",
        "channel": "@dragonflyuas", # Example handle
        "streamingURL": "",
        "source": "youtube"
    },
    {
        "deviceId": 5, # Added device ID 5 for stationary video
        "deviceType": "stationaryVideo", # You can define a specific type here
        "channel": "@qouteofday", # The channel you want to use
        "streamingURL": "",
        "source": "youtube"
    }
]

async def resolve_handle_to_channel_id(handle: str, api_key: str) -> Optional[str]:
    """
    Resolve YouTube @handle to channel ID using the YouTube Data API's channels.list endpoint.
    This is more robust than scraping.
    """
    base_url = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        "part": "snippet", # We only need snippet, could also use 'id'
        "forHandle": handle.lstrip('@'), # The handle without the '@'
        "key": api_key
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(base_url, params=params)
            response.raise_for_status() # Raise an exception for 4xx/5xx responses
            data = response.json()

            items = data.get("items", [])
            if items:
                # The channel ID is in items[0]['id']
                return items[0]["id"]
            else:
                print(f"YouTube API could not resolve channel ID for handle {handle}. No items found.")
                return None
    except httpx.HTTPStatusError as e:
        print(f"HTTP error resolving handle {handle} via YouTube API: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 400:
            print("This might happen if the handle format is invalid for the API or API key is missing.")
        elif e.response.status_code == 403:
            print("YouTube API Key might be invalid, not enabled, or quota exceeded.")
        return None
    except httpx.RequestError as e:
        print(f"Network error resolving handle {handle} via YouTube API: {e}")
        return None
    except Exception as e:
        print(f"General error resolving handle {handle} via YouTube API: {e}")
        return None

async def get_live_video_id(api_key: str, channel_id: str) -> Optional[str]:
    """
    Return live video ID for a channel if it's currently live, using YouTube Data API.
    Uses httpx for asynchronous requests.
    """
    base_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "channelId": channel_id,
        "eventType": "live",
        "type": "video",
        "key": api_key
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])
            if items:
                return items[0]["id"]["videoId"]
            else:
                return None
    except httpx.HTTPStatusError as e:
        print(f"HTTP error getting live video ID for channel {channel_id}: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 403:
            print("YouTube API Key might be invalid or quota exceeded.")
        return None
    except httpx.RequestError as e:
        print(f"Network error getting live video ID for channel {channel_id}: {e}")
        return None
    except Exception as e:
        print(f"Error getting live video ID for channel {channel_id}: {e}")
        return None

@router.get("/get_live_streams", response_model=StreamResponse)
async def get_live_youtube_streams(
    device_id: Optional[int] = Query(None, description="Optional Device ID to filter streams. If not provided, all YouTube-sourced streams will be processed."),
    channel: Optional[str] = Query(None, description="Optional Channel handle or ID to filter streams.")
):
    """
    Processes a predefined list of devices to check for live YouTube streams
    and updates their streaming URLs.
    Optionally filters by a specific deviceId.
    """
    streams_to_process = [DeviceStream(**dict(s)) for s in STATIC_STREAM_DATA]
    
    updated_streams: list[DeviceStream] = []

    for stream in streams_to_process:
        # Check for device ID filter AND channel filter
        # If channel is provided, match only that specific channel from STATIC_STREAM_DATA
        # This allows the frontend to request a specific channel from the static list.
        if (device_id is not None and stream.deviceId != device_id) or \
           (channel is not None and stream.channel.lower() != channel.lower()): # Case-insensitive channel comparison
            updated_streams.append(stream)
            continue

        if stream.source == 'youtube':
            channel_id_to_lookup: Optional[str] = None
            if stream.channel.startswith('@'):
                # Pass the API key to the handle resolution function
                channel_id_to_lookup = await resolve_handle_to_channel_id(stream.channel, settings.YOUTUBE_API_KEY)
            elif stream.channel: # Assume it's already a UC-style ID if not an @handle
                channel_id_to_lookup = stream.channel

            if channel_id_to_lookup:
                live_video_id = await get_live_video_id(settings.YOUTUBE_API_KEY, channel_id_to_lookup)
                if live_video_id:
                    stream.streamingURL = live_video_id
                    print(f"Found live stream for {stream.channel}: {live_video_id}")
                else:
                    stream.streamingURL = ""
                    print(f"No live stream found for {stream.channel} currently.")
            else:
                stream.streamingURL = ""
                print(f"Could not resolve channel ID for {stream.channel}. Streaming URL set to empty.")
        
        updated_streams.append(stream)

    return StreamResponse(status=True, message="success", data=updated_streams)
