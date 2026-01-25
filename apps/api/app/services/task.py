"""
Task Service
Business logic for Task operations
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date

from app.external.unolo_client import UnoloClient, UnoloClientError
from app.schemas.task import TaskCreate, TaskSyncResponse, Task
from app.repository.task_repository import task_repository

logger = logging.getLogger(__name__)

async def sync_tasks(
    start_date: date,
    end_date: date,
    custom_task_name: str
) -> TaskSyncResponse:
    """
    Fetch tasks from external API and sync to local DB.
    """
    client = UnoloClient()
    stats = {"total_fetched": 0, "created": 0, "updated": 0, "errors": 0}
    
    try:
        # 1. Fetch from Unolo
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        logger.info(f"Fetching tasks '{custom_task_name}' from {start_str} to {end_str}")
        
        tasks_data = await client.get_tasks_detail(
            start=start_str, 
            end=end_str, 
            custom_task_name=custom_task_name
        )
        
        print(f"Fetched {tasks_data} tasks")
        
        stats["total_fetched"] = len(tasks_data)
        logger.info(f"Fetched {len(tasks_data)} tasks")
        
        # 2. Process and Upsert
        for item in tasks_data:
            try:
                # Basic validation / cleanup if needed
                if item.get("clientID") is not None:
                    item["clientID"] = str(item["clientID"])
                if item.get("employeeID") is not None:
                    item["employeeID"] = str(item["employeeID"])
                
                # Extract known fields based on schema aliases/names
                known_fields = {
                    "taskID", "clientID", "employeeID", "internalEmpID", "date",
                    "checkinTime", "checkoutTime", "lat", "lon", "taskDescription",
                    "address", "customFieldsComplex", "customEntity",
                    "createdBy", "createdByName", "lastModifiedBy", "lastModifiedByName"
                }

                metadata = {}
                for key, value in item.items():
                    if key not in known_fields:
                        metadata[key] = value
                
                item["metadata"] = metadata
                    
                # Create Pydantic model
                task = TaskCreate(**item)
                
                # Upsert using repository
                result = await task_repository.upsert(task)
                
                if result.upserted_id:
                    stats["created"] += 1
                elif result.modified_count > 0:
                    stats["updated"] += 1
                
            except Exception as e:
                logger.error(f"Error processing task {item.get('taskID', 'unknown')}: {e}")
                stats["errors"] += 1
                
        logger.info(f"Task sync completed: {stats}")
        return TaskSyncResponse(**stats)
        
    finally:
        await client.close()


async def get_tasks(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    custom_task_name: Optional[str] = None,
    employee_id: Optional[int] = None,
    limit: int = 100,
    skip: int = 0
) -> Dict[str, Any]:
    """
    Get tasks from DB with filters.
    """
    query: Dict[str, Any] = {}
    
    # Date filtering on 'date' field
    if start_date or end_date:
        date_query = {}
        if start_date:
            # Create datetime at start of day
            start_dt = datetime(start_date.year, start_date.month, start_date.day)
            date_query["$gte"] = start_dt
        if end_date:
            # Create datetime for user provided date (assumes checking against midnight-normalized dates)
            # If dates are stored as midnight datetimes:
            end_dt = datetime(end_date.year, end_date.month, end_date.day)
            date_query["$lte"] = end_dt
        if date_query:
            query["date"] = date_query
            
    if custom_task_name:
        # Search in customEntity or description if needed? 
        # API requires customTaskName for sync, but for local query we might check where it's stored.
        # Assuming Unolo tasks don't explicitly store "customTaskName" as a top-level field 
        # unless it's in 'taskDescription' or 'customEntity'.
        # For now, let's assume we filter by taskDescription or check requirements.
        # Requirement said: "Index on: date, employee_id, custom_entity_name"
        # So likely custom_entity_name matches customTaskName
        query["customEntity.customEntityName"] = {"$regex": custom_task_name, "$options": "i"}
        
    if employee_id:
        query["employeeID"] = employee_id

    tasks, total = await task_repository.find_with_filters(query, limit, skip)
    
    # Convert TaskInDB to Task response model (handles alias mapping)
    tasks_response = [Task.model_validate(t) for t in tasks]

    return {
        "data": tasks_response,
        "total": total,
        "limit": limit,
        "skip": skip
    }
