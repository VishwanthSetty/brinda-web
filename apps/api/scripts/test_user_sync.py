import asyncio
import sys
import os
from unittest.mock import MagicMock, patch, AsyncMock

# Add app directory to path
sys.path.append(os.path.join(os.getcwd()))

# Mock dependencies before import
sys.modules["motor"] = MagicMock()
sys.modules["motor.motor_asyncio"] = MagicMock()

async def test_user_sync_integration():
    print("Starting User Sync Integration Test...")
    
    # Needs to match what is imported in app.services.user
    with patch("app.services.user.user_repository") as mock_user_repo:
        mock_user_repo.get_by_email = AsyncMock(return_value=None) # Simulate user not found
        mock_user_repo.create = AsyncMock(return_value={"_id": "new_user_id", "email": "test@example.com", "role": "sales_rep", "full_name": "Test User", "is_active": True, "created_at": "now", "updated_at": "now"})
        
        # Test create_user_if_not_exists directly
        from app.services.user import create_user_if_not_exists
        from app.models.employee import Employee
        
        emp = Employee(
            empName="Test User",
            empID="E001",
            empEmail="test@example.com"
        )
        
        print("Testing create_user_if_not_exists...")
        user = await create_user_if_not_exists(emp)
        
        # Verify user creation
        assert user is not None
        assert user.email == "e001@brinda.com"
        assert user.role == "sales_rep"
        mock_user_repo.get_by_email.assert_called_with("e001@brinda.com")
        assert mock_user_repo.create.called
        print("✓ User creation logic works")
        
        # Verify it skips if empID missing
        emp_no_id = Employee(empName="No ID")
        result = await create_user_if_not_exists(emp_no_id)
        assert result is None
        print("✓ Skips employee without ID")

if __name__ == "__main__":
    asyncio.run(test_user_sync_integration())
