import asyncio
import sys
import os
from unittest.mock import MagicMock, patch, AsyncMock

# Add app directory to path
sys.path.append(os.path.join(os.getcwd()))

# Mock dependencies before import
sys.modules["motor"] = MagicMock()
sys.modules["motor.motor_asyncio"] = MagicMock()
sys.modules["httpx"] = MagicMock()

from app.services.employee import sync_employees
from app.models.employee import Employee

async def test_sync_employees():
    print("Starting sync test...")
    
    # Mock data from Unolo
    mock_employees = [
        {
            "empName": "John Doe",
            "firstName": "John",
            "lastName": "Doe",
            "empID": "EMP001",
            "employeeID": 101,
            "empEmail": "john.doe@example.com",
            # other fields optional
        },
        {
            "empName": "Jane Smith",
            "empID": "EMP002",
            # minimal fields
        }
    ]
    
    # Mock UnoloClient
    with patch("app.services.employee.UnoloClient") as MockClient:
        # Setup mock instance
        mock_instance = MockClient.return_value
        mock_instance.get_all_employees.return_value = mock_employees
        mock_instance.close = MagicMock() # async mock usually needed but close is just called, simple mock might suffice or AsyncMock
        
        # We need AsyncMock for async methods
        from unittest.mock import AsyncMock
        mock_instance.get_all_employees = AsyncMock(return_value=mock_employees)
        mock_instance.close = AsyncMock()

        # Mock Repository
        with patch("app.services.employee.employee_repository") as mock_repo:
            # Mock upsert result
            mock_result_created = MagicMock()
            mock_result_created.upserted_id = "some_id"
            mock_result_created.modified_count = 0
            
            mock_result_updated = MagicMock()
            mock_result_updated.upserted_id = None
            mock_result_updated.modified_count = 1
            
            # Make upsert return different results for different calls
            mock_repo.upsert = AsyncMock(side_effect=[mock_result_created, mock_result_updated])
            
            # Run sync
            stats = await sync_employees()
            
            print(f"Sync Stats: {stats}")
            
            # Verify interactions
            assert stats["total_fetched"] == 2
            assert stats["created"] == 1
            assert stats["updated"] == 1
            assert stats["errors"] == 0
            
            print("✓ Sync logic verified successfully!")

if __name__ == "__main__":
    asyncio.run(test_sync_employees())
