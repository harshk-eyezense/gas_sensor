import json
import re
from typing import List, Dict, Optional, Any
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
    streamingURL: str = "" # Default to empty string
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
STATIC_STREAM_DATA: list[Dict[str, Any]] = [
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
    }
]

async def resolve_handle_to_channel_id(handle: str) -> Optional[str]:
    """
    Convert YouTube @handle to channel ID by scraping the YouTube page.
    Uses httpx for asynchronous requests.
    """
    try:
        url = f"https://www.youtube.com/{handle.lstrip('@')}" # Remove '@' if present
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            html = response.text

        match = re.search(r'https://www\.youtube\.com/channel/(UC[\w-]+)', html)
        if match:
            return match.group(1)
        else:
            print(f"Could not resolve channel ID from handle {handle}")
            return None
    except httpx.HTTPStatusError as e:
        print(f"HTTP error resolving handle {handle}: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Network error resolving handle {handle}: {e}")
        return None
    except Exception as e:
        print(f"Error resolving handle {handle}: {e}")
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
    device_id: Optional[int] = Query(None, description="Optional Device ID to filter streams. If not provided, all YouTube-sourced streams will be processed.")
):
    """
    Processes a predefined list of devices to check for live YouTube streams
    and updates their streaming URLs.
    Optionally filters by a specific deviceId.
    """
    # Create a deep copy of the STATIC_STREAM_DATA to avoid modifying the global constant
    streams_to_process = [DeviceStream(**dict(s)) for s in STATIC_STREAM_DATA]
    
    updated_streams: List[DeviceStream] = []

    for stream in streams_to_process:
        # Check for device ID filter
        if device_id is not None and stream.deviceId != device_id:
            # If a device_id is specified and it doesn't match, just add to response and continue
            updated_streams.append(stream)
            continue

        if stream.source == 'youtube':
            channel = stream.channel
            channel_id: Optional[str] = None

            if channel.startswith('@'):
                channel_id = await resolve_handle_to_channel_id(channel)
            elif channel: # Assume it's already a UC-style ID if not an @handle
                channel_id = channel

            if channel_id:
                live_video_id = await get_live_video_id(settings.YOUTUBE_API_KEY, channel_id)
                if live_video_id:
                    stream.streamingURL = live_video_id
                    print(f"Found live stream for {channel}: {live_video_id}")
                else:
                    stream.streamingURL = ""
                    print(f"No live stream found for {channel} currently.")
            else:
                stream.streamingURL = ""
                print(f"Could not resolve channel ID for {channel}. Streaming URL set to empty.")
        
        updated_streams.append(stream)

    return StreamResponse(status=True, message="success", data=updated_streams)