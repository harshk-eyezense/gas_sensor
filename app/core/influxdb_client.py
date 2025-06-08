from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from influxdb_client.client.flux_table import FluxStructure
from app.core.config import settings
from datetime import datetime, timedelta
import pytz # For timezone awareness, good practice for timestamps

# Initialize InfluxDB Client
# This client will be reused across the application
try:
    influxdb_client = InfluxDBClient(
        url=settings.INFLUXDB_URL,
        token=settings.INFLUXDB_TOKEN,
        org=settings.INFLUXDB_ORG
    )
    write_api = influxdb_client.write_api(write_options=SYNCHRONOUS)
    query_api = influxdb_client.query_api()
except Exception as e:
    print(f"Error initializing InfluxDB client: {e}")
    # In a real application, you might want to handle this more gracefully,
    # perhaps by exiting or disabling InfluxDB features.
    influxdb_client = None
    write_api = None
    query_api = None

# Measurement name for sensor readings
MEASUREMENT_NAME = "gas_sensor_reading"

def write_sensor_reading(sensor_id: str, gas_type: str, value: float, timestamp: datetime = None):
    """
    Writes a single gas sensor reading to InfluxDB.

    Args:
        sensor_id (str): Unique identifier for the sensor.
        gas_type (str): Type of gas being measured (e.g., "CO", "CH4").
        value (float): The measured value of the gas.
        timestamp (datetime, optional): The timestamp of the reading. If None, current UTC time is used.
    """
    if not write_api:
        print("InfluxDB write API not initialized. Cannot write data.")
        return

    if timestamp is None:
        # Use timezone-aware UTC for consistency
        timestamp = datetime.utcnow().replace(tzinfo=pytz.utc)
    elif timestamp.tzinfo is None:
        # If timestamp is naive, assume UTC and make it aware
        timestamp = timestamp.replace(tzinfo=pytz.utc)

    point = (
        Point(MEASUREMENT_NAME)
        .tag("sensor_id", sensor_id)
        .tag("gas_type", gas_type)
        .field("value", value)
        .time(timestamp)
    )
    try:
        write_api.write(bucket=settings.INFLUXDB_BUCKET, org=settings.INFLUXDB_ORG, record=point)
        print(f"Successfully wrote data point: {point.to_line_protocol()}")
    except Exception as e:
        print(f"Error writing data to InfluxDB: {e}")

async def query_sensor_readings(
    sensor_id: str = None,
    gas_type: str = None,
    start_time: datetime = None,
    end_time: datetime = None,
    limit: int = 100,
    sort_desc: bool = True
) -> list:
    """
    Queries gas sensor readings from InfluxDB.

    Args:
        sensor_id (str, optional): Filter by sensor ID.
        gas_type (str, optional): Filter by gas type.
        start_time (datetime, optional): Start time for the query range. If None, defaults to -24h.
        end_time (datetime, optional): End time for the query range. If None, defaults to now.
        limit (int): Maximum number of records to return.
        sort_desc (bool): Sort results in descending order by time if True, ascending otherwise.

    Returns:
        list: A list of dictionaries, each representing a sensor reading.
    """
    if not query_api:
        print("InfluxDB query API not initialized. Cannot query data.")
        return []

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
      |> filter(fn: (r) => r._measurement == "{MEASUREMENT_NAME}")
    '''

    if sensor_id:
        flux_query += f' |> filter(fn: (r) => r.sensor_id == "{sensor_id}")'
    if gas_type:
        flux_query += f' |> filter(fn: (r) => r.gas_type == "{gas_type}")'

    # Filter for the 'value' field (which holds our sensor reading)
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
        print(f"Successfully queried {len(results)} records.")
    except Exception as e:
        print(f"Error querying data from InfluxDB: {e}")
    
    return results

def delete_sensor_readings(
    sensor_id: str = None,
    gas_type: str = None,
    start_time: datetime = None,
    end_time: datetime = None
):
    """
    Deletes gas sensor readings from InfluxDB within a specified time range and optional filters.
    Note: InfluxDB delete operations are range-based and filtered.
    Deleting specific single points is generally not how time-series databases are designed.

    Args:
        sensor_id (str, optional): Filter by sensor ID.
        gas_type (str, optional): Filter by gas type.
        start_time (datetime, optional): Start time for deletion range. REQUIRED.
        end_time (datetime, optional): End time for deletion range. REQUIRED.
    """
    if not influxdb_client: # Use the main client for delete, as delete_api needs it
        print("InfluxDB client not initialized. Cannot delete data.")
        return

    if start_time is None or end_time is None:
        print("Start and end times are required for deletion in InfluxDB.")
        return

    # Ensure timestamps are timezone-aware UTC
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=pytz.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=pytz.utc)

    # InfluxDB's delete API uses a predicate
    # Example predicate: '_measurement="gas_sensor_reading" AND sensor_id="sensor1"'
    predicate_parts = [f'_measurement="{MEASUREMENT_NAME}"']
    if sensor_id:
        predicate_parts.append(f'sensor_id="{sensor_id}"')
    if gas_type:
        predicate_parts.append(f'gas_type="{gas_type}"')
    
    predicate = " AND ".join(predicate_parts)

    try:
        delete_api = influxdb_client.delete_api()
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

def close_influxdb_client():
    """Closes the InfluxDB client connection."""
    if influxdb_client:
        influxdb_client.close()
        print("InfluxDB client closed.")
