from pydantic import ValidationError
from app.schemas.unolo import UnoloTaskWebhook
import json

# Mock payload based on the user's error log
payload_list = [
    {
        "taskID": "C1D4857D-A1DD-42BB-86E0-90E810119BBC",
        "clientID": "88837BBA-23DF-4D4F-BCC3-55159CD1C9CB",
        "employeeID": 192542,
        "date": "2026-02-11",
        "adminAssigned": 0,
        "checkinTime": "2026-02-11T17:36:18Z",
        "checkoutTime": "2026-02-11T17:40:00Z",
        "lat": 17.441805,
        "lon": 78.445997,
        "taskDescription": "School Visit",
        "taskStatus": "completed"
    }
]

payload_single = payload_list[0]

print("--- Testing List Payload ---")
try:
    # This is what fails in the actual app
    UnoloTaskWebhook.model_validate(payload_list)
    print("List payload validated successfully (Unexpected)")
except ValidationError as e:
    print(f"List payload validation failed as expected: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

print("\n--- Testing Single Payload ---")
try:
    UnoloTaskWebhook.model_validate(payload_single)
    print("Single payload validated successfully (Expected)")
except ValidationError as e:
    print(f"Single payload validation failed: {e}")
