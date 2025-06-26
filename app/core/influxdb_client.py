from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime, timedelta
from typing import Optional, Any
import traceback
import pytz # Added for timezone awareness in datetime

from app.config.config import settings

# Initialize InfluxDB Client (global instance to manage connection pool)
# This should be initialized lazily to avoid issues with FastAPI's startup/reload.
_influxdb_client: Optional[InfluxDBClient] = None

def get_influxdb_client() -> InfluxDBClient:
    """
    Initializes and returns the InfluxDB client.
    This function ensures the client is a singleton and is properly configured
    using settings loaded from environment variables.
    """
    global _influxdb_client
    if _influxdb_client is None:
        try:
            _influxdb_client = InfluxDBClient(
                url=settings.INFLUXDB_URL,
                token=settings.INFLUXDB_TOKEN,
                org=settings.INFLUXDB_ORG
            )
            print("InfluxDB client initialized successfully.")
        except Exception as e:
            print(f"Error initializing InfluxDB client: {e}")
            raise ConnectionError(f"Could not connect to InfluxDB: {e}")
    return _influxdb_client

def close_influxdb_client():
    """
    Closes the InfluxDB client connection.
    Called during application shutdown.
    """
    global _influxdb_client
    if _influxdb_client:
        _influxdb_client.close()
        _influxdb_client = None
        print("InfluxDB client closed.")

# Measurement name for gas sensor readings
GAS_SENSOR_MEASUREMENT_NAME = "gas_sensor_reading"
# Measurement name for acoustic sensor readings
ACOUSTIC_SENSOR_MEASUREMENT_NAME = "acoustic_sensor_reading"

def write_sensor_reading(sensor_id: str, gas_type: str, value: float, timestamp: Optional[datetime] = None):
    """
    Writes a single gas sensor reading to InfluxDB.
    """
    client = get_influxdb_client()
    write_api = client.write_api(write_options=SYNCHRONOUS)

    if timestamp is None:
        timestamp = datetime.utcnow().replace(tzinfo=pytz.utc)
    elif timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=pytz.utc)

    point = (
        Point(GAS_SENSOR_MEASUREMENT_NAME)
        .tag("sensor_id", sensor_id)
        .tag("gas_type", gas_type)
        .field("value", value)
        .time(timestamp)
    )
    
    try:
        write_api.write(bucket=settings.INFLUXDB_BUCKET, org=settings.INFLUXDB_ORG, record=point)
        # print(f"Successfully wrote data point: {point.to_line_protocol()}") # Uncomment for verbose logging
    except Exception as e:
        print(f"Error writing gas sensor data to InfluxDB: {e}")
        traceback.print_exc()
        raise

async def query_sensor_readings(
    sensor_id: Optional[str] = None,
    gas_type: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
    sort_desc: bool = True
) -> list[dict[str, Any]]:
    """
    Queries gas sensor readings from InfluxDB.
    """
    client = get_influxdb_client()
    query_api = client.query_api()

    # Default time range if not provided
    if start_time is None:
        start_time = datetime.utcnow().replace(tzinfo=pytz.utc) - timedelta(hours=24)
    elif start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=pytz.utc)

    if end_time is None:
        end_time = datetime.utcnow().replace(tzinfo=pytz.utc)
    elif end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=pytz.utc)

    flux_query = f'''
    from(bucket: "{settings.INFLUXDB_BUCKET}")
      |> range(start: {start_time.isoformat()}, stop: {end_time.isoformat()})
      |> filter(fn: (r) => r._measurement == "{GAS_SENSOR_MEASUREMENT_NAME}")
    '''

    if sensor_id:
        flux_query += f' |> filter(fn: (r) => r.sensor_id == "{sensor_id}")'
    if gas_type:
        flux_query += f' |> filter(fn: (r) => r.gas_type == "{gas_type}")'

    flux_query += ' |> filter(fn: (r) => r._field == "value")'
    
    if sort_desc:
        flux_query += ' |> sort(columns: ["_time"], desc: true)'
    else:
        flux_query += ' |> sort(columns: ["_time"], desc: false)'

    flux_query += f' |> limit(n: {limit})'

    results = []
    try:
        tables = query_api.query(flux_query, org=settings.INFLUXDB_ORG)
        for table in tables:
            for record in table.records:
                results.append({
                    "sensor_id": record["sensor_id"],
                    "gas_type": record["gas_type"],
                    "value": record.get_value(),
                    "timestamp": record.get_time().isoformat()
                })
        print(f"Successfully queried {len(results)} gas sensor records.")
    except Exception as e:
        print(f"Error querying gas sensor data from InfluxDB: {e}")
        traceback.print_exc()
        raise
    
    return results

def delete_sensor_readings(
    sensor_id: Optional[str] = None,
    gas_type: Optional[str] = None,
    start_time: datetime = None,
    end_time: datetime = None
):
    """
    Deletes gas sensor readings from InfluxDB within a specified time range and optional filters.
    Note: InfluxDB delete operations are range-based and filtered.
    Deleting specific single points is generally not how time-series databases are designed.
    """
    client = get_influxdb_client() # Use the main client for delete
    delete_api = client.delete_api()

    if start_time is None or end_time is None:
        print("Start and end times are required for deletion in InfluxDB.")
        raise ValueError("Start and end times must be provided for deletion.")

    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=pytz.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=pytz.utc)

    predicate_parts = [f'_measurement="{GAS_SENSOR_MEASUREMENT_NAME}"']
    if sensor_id:
        predicate_parts.append(f'sensor_id="{sensor_id}"')
    if gas_type:
        predicate_parts.append(f'gas_type="{gas_type}"')
    
    predicate = " AND ".join(predicate_parts)

    try:
        delete_api.delete(
            start=start_time,
            stop=end_time,
            predicate=predicate,
            bucket=settings.INFLUXDB_BUCKET,
            org=settings.INFLUXDB_ORG
        )
        print(f"Successfully initiated delete operation for: {predicate} from {start_time.isoformat()} to {end_time.isoformat()}")
    except Exception as e:
        print(f"Error deleting data from InfluxDB: {e}")
        traceback.print_exc()
        raise

def trimmed_mean(values: list[float], trim: int = 1) -> float:
    """
    Calculates the trimmed mean of a list of values.
    Removes 'trim' smallest and 'trim' largest values before calculating mean.
    """
    sorted_vals = sorted(values)
    if len(sorted_vals) <= 2 * trim:
        return sum(sorted_vals) / len(sorted_vals) if sorted_vals else 0.0
    trimmed = sorted_vals[trim:-trim]
    return sum(trimmed) / len(trimmed)

async def query_and_process_influxdb_data(
    sensor_id: str,
    gas_type: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """
    Queries raw gas sensor readings from InfluxDB with filters and returns processed records.
    This function serves as a wrapper for `query_sensor_readings` to match previous expectations.
    """
    # This function now calls the new `query_sensor_readings` directly
    records = await query_sensor_readings(
        sensor_id=sensor_id,
        gas_type=gas_type,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        sort_desc=False # For chronological processing
    )
    # No further processing (like hex parsing or complex internal stats) is done here
    # as the data from InfluxDB is already numeric and structured.
    return records

def write_acoustic_reading(device_id: str, sensor_type: str, readings: list[float], base_timestamp: datetime, sampling_rate_hz: int):
    """
    Writes multiple acoustic sensor readings from a single batch to InfluxDB,
    each as a separate point with an offset timestamp based on sampling rate.
    """
    client = get_influxdb_client()
    write_api = client.write_api(write_options=SYNCHRONOUS)

    points = []
    time_per_sample_us = (1 / sampling_rate_hz) * 1_000_000 if sampling_rate_hz > 0 else 0

    for i, value in enumerate(readings):
        point_timestamp = base_timestamp + timedelta(microseconds=int(i * time_per_sample_us))
        
        point = (
            Point(ACOUSTIC_SENSOR_MEASUREMENT_NAME)
            .tag("device_id", device_id)
            .tag("sensor_type", sensor_type)
            .field("value", value)
            .time(point_timestamp)
        )
        points.append(point)
    
    if points:
        try:
            write_api.write(bucket=settings.INFLUXDB_BUCKET, org=settings.INFLUXDB_ORG, record=points)
        except Exception as e:
            print(f"Error writing acoustic data to InfluxDB: {e}")
            traceback.print_exc()
            raise

async def query_acoustic_readings(
    device_id: str,
    sensor_type: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 1000,
) -> list[dict[str, Any]]:
    """
    Queries acoustic sensor readings from InfluxDB.
    """
    client = get_influxdb_client()
    query_api = client.query_api()

    flux_query = f'from(bucket: "{settings.INFLUXDB_BUCKET}")'

    if start_time and end_time:
        flux_query += f' |> range(start: {start_time.isoformat()}Z, stop: {end_time.isoformat()}Z)'
    elif start_time:
        flux_query += f' |> range(start: {start_time.isoformat()}Z)'
    elif end_time:
        flux_query += f' |> range(stop: {end_time.isoformat()}Z)'
    else:
        flux_query += f' |> range(start: -1h)'

    flux_query += f' |> filter(fn: (r) => r._measurement == "{ACOUSTIC_SENSOR_MEASUREMENT_NAME}")'
    flux_query += f' |> filter(fn: (r) => r.device_id == "{device_id}")'
    flux_query += f' |> filter(fn: (r) => r.sensor_type == "{sensor_type}")'
    flux_query += f' |> keep(columns: ["_time", "_value", "device_id", "sensor_type"])'
    flux_query += f' |> sort(columns: ["_time"], desc: false)'
    flux_query += f' |> limit(n: {limit})'

    print(f"Executing InfluxDB Flux query for acoustic data: {flux_query}")

    results_data = []
    try:
        tables = query_api.query(flux_query, org=settings.INFLUXDB_ORG)
        for table in tables:
            for record in table.records:
                results_data.append({
                    "device_id": record["device_id"],
                    "sensor_type": record["sensor_type"],
                    "value": record["_value"],
                    "timestamp": record["_time"].isoformat()
                })
        return results_data
    except Exception as e:
        print(f"Error querying acoustic data from InfluxDB: {e}")
        traceback.print_exc()
        raise