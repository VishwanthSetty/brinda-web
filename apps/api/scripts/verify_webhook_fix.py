import sys
import os
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add the parent directory to sys.path to ensure correct imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock the database connection to avoid side effects
with patch("app.routes.webhooks.get_database") as mock_get_db:
    # Set up the mock DB and collection
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_get_db.return_value = mock_db
    mock_db.__getitem__.return_value = mock_collection
    
    # Mock find_one to return None (simulate new task)
    async def mock_find_one(*args, **kwargs):
        return None
    
    # Mock insert_one
    async def mock_insert_one(*args, **kwargs):
        return {"inserted_id": "mock_id"}
        
    mock_collection.find_one.side_effect = mock_find_one
    mock_collection.insert_one.side_effect = mock_insert_one

    # Import app after patching if possible, or just patch where it's used
    # Since webhooks.py imports get_database, we patch it there.
    
    from app.main import app

    client = TestClient(app)

    def test_webhook_list_payload():
        payload_list = [
            {
                "taskID": "TEST-TASK-001",
                "clientID": "TEST-CLIENT-001",
                "employeeID": 12345,
                "date": "2026-02-13",
                "taskStatus": "pending"
            },
             {
                "taskID": "TEST-TASK-002",
                "clientID": "TEST-CLIENT-002",
                "employeeID": 67890,
                "date": "2026-02-13",
                "taskStatus": "completed"
            }
        ]

        print("Sending list payload to /api/webhooks/tasks...")
        response = client.post("/api/webhooks/tasks", json=payload_list)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response JSON: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get("processed") == 2 and data.get("success_count") == 2:
                print("SUCCESS: Webhook handled list payload correctly.")
            else:
                 print("FAILURE: Webhook returned 200 but counts are wrong.")
        else:
            print("FAILURE: Webhook returned error.")

    if __name__ == "__main__":
        test_webhook_list_payload()
