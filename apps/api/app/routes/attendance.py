"""
Attendance Routes
"""
from typing import Optional, Dict, Any
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.unolo import SyncStatsResponse, AttendanceList
from app.services.attendance import sync_attendance, get_attendance_records
from app.external.unolo_client import UnoloClientError
from app.middleware.auth import get_any_authenticated_user, get_manager_or_admin

router = APIRouter()




@router.get("/", response_model=AttendanceList)
async def get_attendance_endpoint(
    start: Optional[date] = Query(None, description="Filter by start date"),
    end: Optional[date] = Query(None, description="Filter by end date"),
    user_id: Optional[str] = Query(None, alias="userID", description="Filter by User ID"),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_any_authenticated_user)
):
    """
    Get Attendance records from local database.
    """
    result = await get_attendance_records(
        start_date=start,
        end_date=end,
        user_id=user_id,
        limit=limit,
        skip=skip
    )
    return AttendanceList(**result)
