"""
EOD Summary Routes
"""
from typing import Optional, Dict, Any
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.unolo import SyncStatsResponse, EodSummaryList
from app.services.eod_summary import sync_eod_summary, get_eod_summaries
from app.external.unolo_client import UnoloClientError
from app.middleware.auth import get_any_authenticated_user, get_manager_or_admin

router = APIRouter()




@router.get("/", response_model=EodSummaryList)
async def get_eod_summaries_endpoint(
    start: Optional[date] = Query(None, description="Filter by start date"),
    end: Optional[date] = Query(None, description="Filter by end date"),
    employee_id: Optional[int] = Query(None, alias="employeeID"),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_any_authenticated_user)
):
    """
    Get EOD summaries from local database.
    """
    result = await get_eod_summaries(
        start_date=start,
        end_date=end,
        employee_id=employee_id,
        limit=limit,
        skip=skip
    )
    return EodSummaryList(**result)
