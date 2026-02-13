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
    
    # Mock find_one to return None (simulate new task/client)
    async def mock_find_one(*args, **kwargs):
        return None
    
    # Mock insert_one
    async def mock_insert_one(*args, **kwargs):
        return {"inserted_id": "mock_id"}
    
    # Mock update_one
    async def mock_update_one(*args, **kwargs):
        return MagicMock(modified_count=1)
        
    mock_collection.find_one.side_effect = mock_find_one
    mock_collection.insert_one.side_effect = mock_insert_one
    mock_collection.update_one.side_effect = mock_update_one

    # Import app after patching
    from app.main import app

    client = TestClient(app)

    def test_task_webhook_mixed_types():
        # Test payload with integer employeeID and timestamp checkinTime
        payload_list = [
            {
                "taskID": "TEST-MIXED-001",
                "clientID": "TEST-CLIENT-MIXED",
                "employeeID": 192542,       # Integer
                "date": "2026-02-13",
                "checkinTime": 1770957322714, # Timestamp (ms)
                "taskStatus": "pending"
            }
        ]

        print("\n--- Testing Task Webhook (Mixed Types) ---")
        response = client.post("/api/webhooks/tasks", json=payload_list)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response JSON: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get("processed") == 1:
                print("SUCCESS: Task Webhook handled mixed types correctly.")
            else:
                 print("FAILURE: Task Webhook counts wrong.")
        else:
            print("FAILURE: Task Webhook returned error.")

    if __name__ == "__main__":
        test_task_webhook_mixed_types()
