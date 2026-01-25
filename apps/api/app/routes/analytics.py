"""
Analytics Routes
"""

from typing import Optional
from fastapi import APIRouter, Query, Depends, HTTPException
from app.middleware.auth import get_any_authenticated_user
from datetime import date

from app.schemas.analytics import (
    ClientCategoryFilter,
    GroupByField,
    ClientListResponse,
    GroupedClientsResponse,
    TaskClientCategoryFilter,
    TaskAnalyticsResponse,
    AreaWiseTasksResponse,
    SchoolCategoryResponse
)
from app.services.analytics import (
    get_clients_for_employee,
    get_clients_grouped,
    get_all_tasks_for_employee,
    get_area_wise_tasks_with_clients,
    get_clients_by_school_category
)
from app.schemas.user import UserRole

router = APIRouter()

def get_emply_id_from_user(user) -> str:
    """Extract employee ID from email (e.g. emp001@brinda.com -> emp001)."""
    if not user.email:
        raise HTTPException(status_code=400, detail="User email required for filtering")
    
    # Assuming email format is always {empID}@brinda.com
    # Split by @ and take the first part
    return user.email.split("@")[0]

def get_employee_id_from_user(user) -> str:
    """Extract employee ID from email (e.g. emp001@brinda.com -> emp001)."""
    if not user.employeeId:
        raise HTTPException(status_code=400, detail="User employee_id required for filtering")
    
    # Assuming email format is always {empID}@brinda.com
    # Split by @ and take the first part
    return user.employeeId

@router.get("/clients", response_model=ClientListResponse)
async def get_employee_clients(
    client_category: Optional[ClientCategoryFilter] = Query(
        None, description="Filter by client category"
    ),
    employee_id: Optional[str] = Query(None, description="Employee ID (for managers)"),
    current_user = Depends(get_any_authenticated_user),
):
    """
    Get all clients for the logged-in employee.
    Managers can filter by specific employee_id.
    Auto-filters based on the user's email prefix (empID) if not specified.
    """
    target_emp_id = get_emply_id_from_user(current_user)
    
    if current_user.role == UserRole.MANAGER and employee_id:
        target_emp_id = employee_id
        
    print(f"Fetching clients for: {target_emp_id}")
    clients, total = await get_clients_for_employee(target_emp_id, client_category)
    return {
        "data": clients,
        "total": total
    }

@router.get("/clients/grouped", response_model=GroupedClientsResponse)
async def get_employee_clients_grouped(
    group_by: GroupByField = Query(..., description="AREA_WISE or MATERIAL"),
    client_category: Optional[ClientCategoryFilter] = Query(
        None, description="Filter by client category"
    ),
    employee_id: Optional[str] = Query(None, description="Employee ID (for managers)"),
    current_user = Depends(get_any_authenticated_user),
):
    """
    Get clients grouped by specific field (Area or Material).
    Managers can filter by specific employee_id.
    Auto-filters based on the user's email prefix (empID) if not specified.
    """
    target_emp_id = get_emply_id_from_user(current_user)
    
    if current_user.role == UserRole.MANAGER and employee_id:
        target_emp_id = employee_id
    
    groups, unassigned, total = await get_clients_grouped(
        target_emp_id, group_by, client_category
    )
    
    return {
        "groups": groups,
        "unassigned": unassigned,
        "total": total
    }

# --- Task Analytics Routes ---

@router.get("/tasks", response_model=TaskAnalyticsResponse)
async def get_employee_tasks_analytics(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    client_category: Optional[TaskClientCategoryFilter] = Query(
        None, description="Filter: School, Distributor, or Both"
    ),
    employee_id: Optional[str] = Query(None, description="Employee ID (for managers)"),
    current_user = Depends(get_any_authenticated_user),
):
    """
    API 1: Get all tasks done by employee with metadata in between the dates.
    Display all the tasks done send metadata also in the response.
    """
    target_emp_id = get_employee_id_from_user(current_user)
    
    if current_user.role == UserRole.MANAGER and employee_id:
        target_emp_id = employee_id
    print(f"Fetching tasks for: {target_emp_id}")

    return await get_all_tasks_for_employee(
        target_emp_id, start, end, client_category
    )

@router.get("/tasks/area-wise", response_model=AreaWiseTasksResponse)
async def get_area_wise_client_tasks(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    client_category: Optional[TaskClientCategoryFilter] = Query(
        None, description="Filter: School, Distributor, or Both"
    ),
    employee_id: Optional[str] = Query(None, description="Employee ID (for managers)"),
    current_user = Depends(get_any_authenticated_user),
):
    """
    API 2: Get tasks grouped by area with unique/total clients in between the dates.
    Get tasks for area wise visited unique clients along with total clients in that area 
    (send client details along with all the tasks he has created for that client).
    """
    target_employee_id = get_employee_id_from_user(current_user)

    
    if current_user.role == UserRole.MANAGER and employee_id :
        target_employee_id = employee_id

    return await get_area_wise_tasks_with_clients(
        target_employee_id, start, end, client_category
    )

@router.get("/tasks/school-category", response_model=SchoolCategoryResponse)
async def get_tasks_by_school_category(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    client_category: Optional[TaskClientCategoryFilter] = Query(
        None, description="Filter: School, Distributor, or Both"
    ),
    employee_id: Optional[str] = Query(None, description="Employee ID (for managers)"),
    current_user = Depends(get_any_authenticated_user),
):
    """
    API 3: Get clients grouped by schoolCategory from latest task in between the dates.
    Get the latest task of the particular client and send list of 
    Hot category/visited school, Cold category/visited schools, No info category/visited schools.
    """
    target_emp_id = get_employee_id_from_user(current_user)
    
    if current_user.role == UserRole.MANAGER and employee_id:
        target_emp_id = employee_id

    return await get_clients_by_school_category(
        target_emp_id, start, end, client_category
    )
