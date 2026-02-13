import sys
import os
import asyncio
from datetime import datetime
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add the parent directory to sys.path to ensure correct imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock the database connection
with patch("app.routes.webhooks.get_database") as mock_get_db:
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_get_db.return_value = mock_db
    mock_db.__getitem__.return_value = mock_collection
    
    # Capture inserted docs
    inserted_docs = []
    async def mock_insert_one(doc):
        inserted_docs.append(doc)
        return {"inserted_id": "mock_id"}
    
    async def mock_find_one(*args, **kwargs):
        return None
    
    async def mock_update_one(*args, **kwargs):
        return MagicMock(modified_count=1)

    mock_collection.find_one.side_effect = mock_find_one
    mock_collection.insert_one.side_effect = mock_insert_one
    mock_collection.update_one.side_effect = mock_update_one

    # Mock settings to check webhook secret (or lack thereof)
    with patch("app.routes.webhooks.get_settings") as mock_settings:
        mock_settings.return_value.webhook_secret = None
        
        # Import app NOW, so it sees the patched get_settings if it uses it at import time (unlikely but safe)
        from app.main import app

        client = TestClient(app)

        def test_webhook_transformations():
            # Payload with integer IDs and timestamp
            payload = [
                {
                    "taskID": "TEST-TRANSFORM-001",
                    "clientID": "TEST-CLIENT-TRANSFORM",
                    "employeeID": 192542,         # Integer, should be string "192542"
                    "internalEmpID": 10021,       # Integer, should be string "10021"
                    "date": "2026-02-13",
                    "checkinTime": 1770957322714, # 2026-02-13 04:35:22.714 UTC
                    "taskStatus": "pending"
                }
            ]

            print("\n--- Testing Webhook Transformations ---")
            # We don't send X-Webhook-Secret, and mock settings expects None, so it should pass
            response = client.post("/api/webhooks/tasks", json=payload)
            
            print(f"Response Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                if inserted_docs:
                    doc = inserted_docs[0]
                    print(f"Inserted Document: {doc}")
                    
                    # Verify IDs are strings
                    emp_id = doc.get("employeeID")
                    print(f"employeeID type: {type(emp_id)}, value: {emp_id}")
                    if isinstance(emp_id, str) and emp_id == "192542":
                        print("SUCCESS: employeeID converted to string.")
                    else:
                        print("FAILURE: employeeID not converted correctly.")
                    
                    internal_emp_id = doc.get("internalEmpID")
                    print(f"internalEmpID type: {type(internal_emp_id)}, value: {internal_emp_id}")
                    if isinstance(internal_emp_id, str) and internal_emp_id == "10021":
                         print("SUCCESS: internalEmpID converted to string.")
                    else:
                         print("FAILURE: internalEmpID not converted correctly.")

                    # Verify checkinTime format
                    checkin = doc.get("checkinTime")
                    print(f"checkinTime type: {type(checkin)}, value: {checkin}")
                    
                    # Expected: 2026-02-13T04:35:22.714+00:00
                    expected_prefix = "2026-02-13T04:35:22.714+00:00"
                    if isinstance(checkin, str) and checkin == expected_prefix:
                        print("SUCCESS: checkinTime formatted correctly.")
                    else:
                        print(f"FAILURE: checkinTime format mismatch. Expected roughly {expected_prefix}")
                else:
                    print("FAILURE: No document inserted.")
            else:
                print("FAILURE: Webhook returned error.")

        if __name__ == "__main__":
            test_webhook_transformations()
