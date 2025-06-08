import os
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import pytz

# Load environment variables
load_dotenv()

# Get settings from environment
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

print(f"Testing InfluxDB connection with:")
print(f"  URL: {INFLUXDB_URL}")
print(f"  Org: {INFLUXDB_ORG}")
print(f"  Bucket: {INFLUXDB_BUCKET}")
print(f"  Token: {'*' * len(INFLUXDB_TOKEN) if INFLUXDB_TOKEN else 'None'}") # Don't print full token

if not all([INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET]):
    print("One or more InfluxDB environment variables are missing. Please check your .env file.")
    exit()

try:
    # Initialize InfluxDB Client
    client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    query_api = client.query_api()

    # --- Test Write Operation ---
    test_sensor_id = "test_script_sensor"
    test_gas_type = "O2"
    test_value = 20.9
    test_timestamp = datetime.utcnow().replace(tzinfo=pytz.utc)

    point = (
        Point("test_measurement")
        .tag("sensor_id", test_sensor_id)
        .tag("gas_type", test_gas_type)
        .field("value", test_value)
        .time(test_timestamp)
    )

    print(f"\nAttempting to write: {point.to_line_protocol()}")
    write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
    print("Write successful!")

    # --- Test Query Operation ---
    print("\nAttempting to query data...")
    query = f'''
    from(bucket: "{INFLUXDB_BUCKET}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "test_measurement")
      |> filter(fn: (r) => r.sensor_id == "{test_sensor_id}")
    '''
    tables = query_api.query(query, org=INFLUXDB_ORG)
    
    found_records = []
    for table in tables:
        for record in table.records:
            found_records.append({
                "sensor_id": record["sensor_id"],
                "gas_type": record["gas_type"],
                "value": record.get_value(),
                "timestamp": record.get_time().isoformat()
            })
    
    if found_records:
        print(f"Query successful! Found {len(found_records)} record(s):")
        for record in found_records:
            print(f"  {record}")
    else:
        print("Query successful, but no records found matching criteria.")

except Exception as e:
    print(f"\nAn error occurred during InfluxDB operation: {e}")
    # Print specific HTTP response if it's an InfluxDB client error
    if hasattr(e, 'response'):
        print(f"HTTP Response Code: {e.response.status}")
        print(f"HTTP Response Body: {e.response.text}")

finally:
    if 'client' in locals() and client:
        client.close()
        print("\nInfluxDB client closed.")

