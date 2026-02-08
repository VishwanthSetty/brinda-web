from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from app.middleware.auth import get_any_authenticated_user
from app.services.all_emp_analytics import get_all_employees_overview
from app.schemas.all_emp_analytics import AllEmployeesOverviewResponse

router = APIRouter()

@router.get("/overview", response_model=AllEmployeesOverviewResponse)
async def get_overview(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user = Depends(get_any_authenticated_user)
):
    """
    Get aggregated analytics overview for all employees.
    Requires admin privileges (checked by middleware or logic if needed, 
    but for now accessible to authenticated users).
    """
    if current_user.role not in ["admin", "manager"]:
         raise HTTPException(status_code=403, detail="Insufficient permissions")

    return await get_all_employees_overview(
        start_date=start,
        end_date=end
    )
