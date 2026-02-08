"""
Attendance Service
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import date

from app.external.unolo_client import UnoloClient
from app.schemas.unolo import UnoloAttendanceResponse, SyncStatsResponse, AttendanceList
from app.repository.attendance_repository import attendance_repository

logger = logging.getLogger(__name__)

async def sync_attendance(
    start_date: date,
    end_date: date
) -> SyncStatsResponse:
    """
    Fetch Attendance from external API and sync to local DB.
    """
    client = UnoloClient()
    stats = {"total_fetched": 0, "created": 0, "updated": 0, "errors": 0}
    
    try:
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        logger.info(f"Fetching Attendance from {start_str} to {end_str}")
        
        # Fetch from Unolo
        data = await client.get_attendance(
            start=start_str, 
            end=end_str
        )
        
        # Normalize data to list if it's a single dict or wrapped
        items_to_process = []
        if isinstance(data, list):
            items_to_process = data
        elif isinstance(data, dict):
            # If it's a single record (as per user example)
            # Check if it has 'userID' which is a required field in our schema
            if "userID" in data:
                items_to_process = [data]
            else:
                # Might be a wrapper we missed or empty
                logger.warning(f"Unexpected attendance response format: {data.keys()}")
        
        stats["total_fetched"] = len(items_to_process)
        logger.info(f"Fetched {len(items_to_process)} Attendance records")
        
        # Process and Upsert
        for item in items_to_process:
            try:
                # Create Pydantic model
                attendance_data = UnoloAttendanceResponse(**item)
                
                # Upsert using repository
                result = await attendance_repository.upsert(attendance_data)
                
                if result.upserted_id:
                    stats["created"] += 1
                elif result.modified_count > 0:
                    stats["updated"] += 1
                
            except Exception as e:
                logger.error(f"Error processing Attendance for {item.get('userID', 'unknown')}: {e}")
                stats["errors"] += 1
                
        logger.info(f"Attendance sync completed: {stats}")
        return SyncStatsResponse(**stats)
        
    finally:
        await client.close()


async def get_attendance_records(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> Dict[str, Any]:
    """
    Get Attendance records from DB with filters.
    """
    query: Dict[str, Any] = {}
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = start_date.strftime("%Y-%m-%d")
        if end_date:
            date_query["$lte"] = end_date.strftime("%Y-%m-%d")
        if date_query:
            query["date"] = date_query
            
    if user_id:
        query["userID"] = user_id

    items, total = await attendance_repository.find_with_filters(query, limit, skip)
    
    response_items = [UnoloAttendanceResponse.model_validate(i) for i in items]

    return {
        "data": response_items,
        "total": total,
        "limit": limit,
        "skip": skip
    }
