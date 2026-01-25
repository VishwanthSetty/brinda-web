"""
Employee Service

Business logic layer for employee data operations.
Uses Unolo external API to fetch employee master data.
"""

import logging
from typing import List, Dict, Any

from app.external.unolo_client import UnoloClient, UnoloClientError
from app.models.employee import Employee
from app.repository.employee_repository import employee_repository
from app.services.user import create_user_if_not_exists

logger = logging.getLogger(__name__)


async def get_all_employees() -> List[Dict[str, Any]]:
    """
    Fetch all employees from the Unolo API.
    
    Returns:
        List of employee dictionaries
        
    Raises:
        UnoloClientError: If the API request fails
    """
    client = UnoloClient()
    
    try:
        employees = await client.get_all_employees()
        logger.info(f"Fetched {len(employees)} employees from Unolo API")
        return employees
    finally:
        await client.close()


async def get_employee_count() -> int:
    """
    Get the total count of employees.
    
    Returns:
        Number of employees
    """
    try:
        return await employee_repository.count()
    except Exception as e:
        logger.error(f"Failed to get employee count from DB, falling back to API: {e}")
        employees = await get_all_employees()
        return len(employees)


async def sync_employees() -> Dict[str, Any]:
    """
    Sync employees from Unolo API to local MongoDB.
    
    Returns:
        Dictionary with sync statistics (total, created, updated, errors)
    """
    client = UnoloClient()
    stats = {"total_fetched": 0, "created": 0, "updated": 0, "errors": 0}
    
    try:
        # 1. Fetch from Unolo
        external_employees = await client.get_all_employees()
        stats["total_fetched"] = len(external_employees)
        logger.info(f"Starting sync for {len(external_employees)} employees")
        
        # 2. Process and Upsert
        for emp_data in external_employees:
            try:
                employee = Employee(**emp_data)
                
                # Upsert using repository
                result = await employee_repository.upsert(employee)
                
                if result.upserted_id:
                    stats["created"] += 1
                elif result.modified_count > 0:
                    stats["updated"] += 1
                
                # Sync User Account
                await create_user_if_not_exists(employee)
                
            except Exception as e:
                logger.error(f"Error syncing employee {emp_data.get('empID', 'unknown')}: {e}")
                stats["errors"] += 1
                
        logger.info(f"Employee sync completed: {stats}")
        return stats
        
    finally:
        await client.close()
