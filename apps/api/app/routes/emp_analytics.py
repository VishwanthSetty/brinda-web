from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException

from app.middleware.auth import get_any_authenticated_user
from app.services.emp_analytics import get_employee_analytics
from app.schemas.emp_analytics import EmployeeAnalyticsResponse

router = APIRouter()

@router.get("/dashboard", response_model=EmployeeAnalyticsResponse)
async def get_employee_dashboard(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    employee_id: Optional[str] = Query(None, description="Employee ID (required for admins/managers)"),
    current_user = Depends(get_any_authenticated_user)
):
    """
    Get employee analytics dashboard data.
    - Tracks present days (Mon-Sat working days only)
    - Tasks per day (present days only)
    - Distance travelled
    - Break analysis
    """
    
    # 1. Resolve Employee ID
    # If user is admin/manager, they must provide employee_id or we use theirs?
    # Usually for analytics dashboard, if employee_id is missing, we default to the current user's ID if they are an employee.
    # If they are an admin without an employee ID, it might fail or return empty.
    
    target_emp_id = employee_id
    
    if not target_emp_id:
        # Try to use current user's employee ID
        target_emp_id = getattr(current_user, "employee_id", None) or getattr(current_user, "empID", None)
        
    if not target_emp_id:
         raise HTTPException(status_code=400, detail="Employee ID is required")
         
    # 2. Call Service
    return await get_employee_analytics(
        employee_id=str(target_emp_id),
        start_date=start,
        end_date=end
    )
