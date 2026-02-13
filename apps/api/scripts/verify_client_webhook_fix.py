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
        
        # Import app NOW
        from app.main import app

        client = TestClient(app)

        def test_client_webhook_transformations():
            # Payload with integer IDs and timestamp
            payload = [
                {
                    "clientID": "TEST-CLIENT-FIX-001",
                    "companyID": 1001,           # Int -> Str
                    "clientName": "Test Client Fix",
                    "timestamp": 1770957322714,  # Int ms -> ISO Str
                    "createdTs": 1760416349000,  # Int ms -> ISO Str
                    "createdByEmpID": 245225,    # Int -> Str
                    "lat": 12.9,
                    "lng": 77.6
                }
            ]

            print("\n--- Testing Client Webhook Transformations ---")
            response = client.post("/api/webhooks/clients", json=payload)
            
            print(f"Response Status: {response.status_code}")
            # print(f"Response: {response.text}")
            
            if response.status_code == 200:
                if inserted_docs:
                    doc = inserted_docs[0]
                    print(f"Inserted Document: {doc}")
                    
                    # Verify IDs are strings
                    cid = doc.get("unolo_client_id")  # This comes from clientID
                    print(f"unolo_client_id type: {type(cid)}, value: {cid}")
                    if isinstance(cid, str) and cid == "TEST-CLIENT-FIX-001":
                        print("SUCCESS: clientID is string.")
                    else:
                        print("FAILURE: clientID mismatch.")
                    
                    # Verify createdByEmpID -> "Visible To (*)" logic converts to string?
                    # The code does: "Visible To (*)": str(item.created_by_emp_id) if item.created_by_emp_id else "Admin"
                    visible = doc.get("Visible To (*)")
                    print(f"Visible To type: {type(visible)}, value: {visible}")
                    if isinstance(visible, str) and visible == "245225":
                         print("SUCCESS: createdByEmpID converted to string in 'Visible To'.")
                    else:
                         print("FAILURE: createdByEmpID not converted correctly.")

                    # Verify timestamps
                    ts = doc.get("unolo_timestamp")
                    print(f"unolo_timestamp type: {type(ts)}, value: {ts}")
                    expected_prefix = "2026-02-13T04:35:22.714+00:00"
                    if isinstance(ts, str) and ts == expected_prefix:
                        print("SUCCESS: timestamp formatted correctly.")
                    else:
                        print(f"FAILURE: timestamp format mismatch. Expected {expected_prefix}")
                        
                    cts = doc.get("unolo_created_ts")
                    print(f"unolo_created_ts value: {cts}")
                    # 1760416349000 -> 2025-10-14 ...
                    if isinstance(cts, str):
                         print("SUCCESS: createdTs formatted as string.")
                    else:
                         print("FAILURE: createdTs not string.")

                else:
                    print("FAILURE: No document inserted.")
            else:
                print(f"FAILURE: Webhook returned error: {response.text}")

        if __name__ == "__main__":
            test_client_webhook_transformations()
