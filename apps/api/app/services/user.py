"""
User Service
"""
from datetime import datetime, timezone
from typing import Optional
import logging

from app.models.employee import Employee
from app.schemas.user import User, UserRole
from app.repository.user_repository import user_repository
from app.utils.security import hash_password

logger = logging.getLogger(__name__)

async def create_user_if_not_exists(employee: Employee) -> Optional[User]:
    """
    Create a new user for the employee if one does not exist.
    Uses default password 'admin123' and role 'sales_rep'.
    """
    if not employee.empID:
        logger.warning(f"Employee has no empID, skipping user creation.")
        return None

    email = f"{employee.empID}@brinda.com".lower()
    
    # Check if user exists
    existing_user = await user_repository.get_by_email(email)
    if existing_user:
        return None
        
    logger.info(f"Creating new user for employee: {email}")
    
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "email": email,
        "password_hash": hash_password("admin123"),
        "full_name": employee.empName or "Unknown",
        "role": UserRole.SALES_REP.value,
        "empId": employee.empID,
        "employeeId": employee.employeeID,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    
    try:
        user_in_db = await user_repository.create(user_doc)
        return User.from_orm(user_in_db)
    except Exception as e:
        logger.error(f"Failed to create user for employee {email}: {e}")
        return None
