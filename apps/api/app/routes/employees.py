"""
Employee Routes

API endpoints for employee data from Unolo external API.
"""

from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from app.middleware.auth import get_admin_user, get_manager_or_admin
from app.services.employee import get_all_employees, sync_employees
from app.external.unolo_client import UnoloClientError

router = APIRouter()





@router.get("/", response_model=List[Dict[str, Any]])
async def list_employees(
    current_user = Depends(get_manager_or_admin)
):
    """
    Get all employees from Unolo Employee Master API.
    Requires ADMIN or MANAGER role.
    
    Returns a list of all employees with their details.
    """
    try:
        employees = await get_all_employees()
        return employees
    except UnoloClientError as e:
        raise HTTPException(
            status_code=e.status_code or 500,
            detail=f"Failed to fetch employees from Unolo: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
