"""
EOD Summary Service
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import date, datetime

from app.external.unolo_client import UnoloClient
from app.schemas.unolo import UnoloEodSummaryResponse, SyncStatsResponse, EodSummaryList
from app.repository.eod_summary_repository import eod_summary_repository

logger = logging.getLogger(__name__)

async def sync_eod_summary(
    start_date: date,
    end_date: date
) -> SyncStatsResponse:
    """
    Fetch EOD summary from external API and sync to local DB.
    """
    client = UnoloClient()
    stats = {"total_fetched": 0, "created": 0, "updated": 0, "errors": 0}
    
    try:
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        logger.info(f"Fetching EOD summary from {start_str} to {end_str}")
        
        # Fetch from Unolo
        data = await client.get_eod_summary(
            start=start_str, 
            end=end_str
        )
        
        stats["total_fetched"] = len(data)
        logger.info(f"Fetched {len(data)} EOD summary records")
        
        # Process and Upsert
        for item in data:
            try:
                # Create Pydantic model
                eod_data = UnoloEodSummaryResponse(**item)
                
                # Upsert using repository
                result = await eod_summary_repository.upsert(eod_data)
                
                if result.upserted_id:
                    stats["created"] += 1
                elif result.modified_count > 0:
                    stats["updated"] += 1
                
            except Exception as e:
                logger.error(f"Error processing EOD summary for emp {item.get('employeeID', 'unknown')}: {e}")
                stats["errors"] += 1
                
        logger.info(f"EOD summary sync completed: {stats}")
        return SyncStatsResponse(**stats)
        
    finally:
        await client.close()


async def get_eod_summaries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
    limit: int = 100,
    skip: int = 0
) -> Dict[str, Any]:
    """
    Get EOD summaries from DB with filters.
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
            
    if employee_id:
        query["employeeID"] = employee_id

    items, total = await eod_summary_repository.find_with_filters(query, limit, skip)
    
    # Convert InDB model to Response model
    # (Pydantic handles this automatically often, but explicit validation is good)
    response_items = [UnoloEodSummaryResponse.model_validate(i) for i in items]

    return {
        "data": response_items,
        "total": total,
        "limit": limit,
        "skip": skip
    }
