"""
Task Routes
API endpoints for managing Tasks
"""
from typing import Optional
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.task import TaskSyncResponse, TaskList
from app.services.task import sync_tasks, get_tasks
from app.external.unolo_client import UnoloClientError
from app.middleware.auth import get_any_authenticated_user

router = APIRouter()

@router.post("/sync", response_model=TaskSyncResponse)
async def sync_tasks_endpoint(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    custom_task_name: str = Query(..., alias="customTaskName", description="Task name to fetch"),
    current_user = Depends(get_any_authenticated_user)
):
    """
    Trigger sync of tasks from Unolo API.
    """
    try:
        if end < start:
            raise HTTPException(status_code=400, detail="End date must be after start date")
            
        return await sync_tasks(start, end, custom_task_name)
    except UnoloClientError as e:
        raise HTTPException(status_code=502, detail=f"External API Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=TaskList)
async def get_tasks_endpoint(
    start: Optional[date] = Query(None, description="Filter by start date"),
    end: Optional[date] = Query(None, description="Filter by end date"),
    custom_task_name: Optional[str] = Query(None, alias="customTaskName", description="Filter by task name"),
    employee_id: Optional[int] = Query(None, alias="employeeID"),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_any_authenticated_user)
):
    """
    Get tasks from local database.
    """
    result = await get_tasks(
        start_date=start,
        end_date=end,
        custom_task_name=custom_task_name,
        employee_id=employee_id,
        limit=limit,
        skip=skip
    )
    return TaskList(**result)
