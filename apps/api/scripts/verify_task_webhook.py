
import sys
import os
import asyncio
from datetime import datetime

# Add apps/api to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas.unolo import UnoloTaskWebhook
from pydantic import ValidationError

def test_schema():
    print("Testing UnoloTaskWebhook schema...")
    
    payload = {
        "taskID": "task123",
        "clientID": "client456",
        "employeeID": "emp789",
        "internalEmpID": "INT001",
        "date": "2023-10-27",
        "checkinTime": "2023-10-27T10:00:00Z",
        "checkoutTime": "2023-10-27T11:00:00Z",
        "taskDescription": "Visit client",
        "address": "123 Main St",
        "lat": 12.34,
        "lon": 56.78,
        "customEntity": {"customEntityName": "Project X"},
        "customFieldsComplex": [{"name": "Priority", "value": "High"}],
        "createdBy": "admin1",
        "createdByName": "Admin User",
        "taskStatus": "completed"
    }
    
    try:
        task = UnoloTaskWebhook.model_validate(payload)
        print("✅ Schema validation successful")
        print(f"Task ID: {task.task_id}")
        print(f"Check-in Time: {task.checkin_time}")
    except ValidationError as e:
        print(f"❌ Schema validation failed: {e}")
        exit(1)

async def test_processing_logic_mock():
    # We can't easily import process_task_webhook_data without app context if it imports db stuff
    # But we can try to import it.
    try:
        from app.routes.webhooks import process_task_webhook_data
        print("✅ Successfully imported process_task_webhook_data")
    except ImportError as e:
        print(f"⚠️ Could not import process_task_webhook_data (likely due to missing env/db deps): {e}")
        return

    # Mock DB
    class MockCollection:
        async def find_one(self, query):
            print(f"MockDB: find_one {query}")
            return None
            
        async def insert_one(self, doc):
            print(f"MockDB: insert_one {doc.keys()}")
            return
            
        async def update_one(self, query, update):
            print(f"MockDB: update_one {query}")
            return

    class MockDB:
        def __getitem__(self, item):
            return MockCollection()

    db = MockDB()
    payload = {
        "taskID": "task123",
        "clientID": "client456",
        "internalEmpID": "INT001",
        "date": "2023-10-27"
    }
    
    print("Testing processing logic with mock DB...")
    result = await process_task_webhook_data(payload, db)
    print(f"Result: {result}")
    
    if result["success"] and result["action"] == "created":
         print("✅ Processing logic test passed")
    else:
         print("❌ Processing logic test failed")

if __name__ == "__main__":
    test_schema()
    asyncio.run(test_processing_logic_mock())
