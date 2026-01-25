"""
Analytics Service
"""

from datetime import date
from typing import Optional, Tuple, List, Dict
from app.repository.client_repository import client_repository
from app.repository.task_repository import task_repository
from app.schemas.client import Client
from app.schemas.analytics import (
    ClientCategoryFilter, 
    GroupByField, 
    TaskClientCategoryFilter,
    TaskAnalyticsResponse,
    AreaWiseTasksResponse,
    SchoolCategoryResponse,
    CategorySummary
)
from app.services.employee import get_all_employees

# Mapping ENUMs to actual DB field names
CLIENT_CATEGORY_FIELD = "Client Catagory (*)"

GROUP_FIELD_MAPPING = {
    GroupByField.AREA_WISE: "Division Name new (*)",
    GroupByField.MATERIAL: "Using Material (*)"
}

async def get_clients_for_employee(
    employee_id: str,
    client_category: Optional[ClientCategoryFilter] = None
) -> Tuple[List[Client], int]:
    """
    Get all clients visible to or created by the employee.
    """
    
    # Fetch all employees to map empID -> employeeID
    all_employees = await get_all_employees()
    employees_map = {str(e.get('employeeID')): e.get('empID') for e in all_employees if e.get('empID') and e.get('employeeID')}
    
    # Resolve correct ID (assume input might be empID, map to employeeID)
    resolved_id = employees_map.get(str(employee_id), employee_id)
    
    category_val = client_category.value if client_category else None
    
    clients = await client_repository.find_clients_by_employee(
        employee_id=resolved_id,
        client_category=category_val
    )
    
    return clients, len(clients)

async def get_clients_grouped(
    employee_id: str,
    group_by: GroupByField,
    client_category: Optional[ClientCategoryFilter] = None
) -> Tuple[Dict[str, List[Client]], List[Client], int]:
    """
    Get clients grouped by specified field.
    Returns: (groups_dict, unassigned_list, total_count)
    """
    category_val = client_category.value if client_category else None
    group_db_field = GROUP_FIELD_MAPPING[group_by]

    # Fetch all employees to map empID -> employeeID
    all_employees = await get_all_employees()
    employees_map = {str(e.get('employeeID')): e.get('empID') for e in all_employees if e.get('empID') and e.get('employeeID')}
    
    # Resolve correct ID (assume input might be empID, map to employeeID)
    resolved_id = employees_map.get(str(employee_id), employee_id)
    
    return await client_repository.aggregate_clients_grouped(
        employee_id=resolved_id,
        group_field=group_db_field,
        client_category=category_val
    )

async def get_all_tasks_for_employee(
    employee_id: str,
    start_date: date,
    end_date: date,
    client_category: Optional[TaskClientCategoryFilter] = None
) -> TaskAnalyticsResponse:
    """
    API 1: Get all tasks done by employee with metadata.
    """
    category_val = client_category.value if client_category else None
    print(employee_id)
    tasks = await task_repository.find_tasks_by_employee_with_client_filter(
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date,
        client_category=category_val
    )
    
    return {"data": tasks, "total": len(tasks)}

async def get_area_wise_tasks_with_clients(
    employee_id: str,
    start_date: date,
    end_date: date,
    client_category: Optional[TaskClientCategoryFilter] = None
) -> AreaWiseTasksResponse:
    """
    API 2: Get tasks grouped by area with unique/total clients.
    """
    
    category_val = client_category.value if client_category else None

    # Fetch all employees to map empID -> employeeID
    all_employees = await get_all_employees()
    employees_map = {str(e.get('employeeID')): e.get('empID') for e in all_employees if e.get('empID') and e.get('employeeID')}
    
    # Resolve correct ID (assume input might be empID, map to employeeID)
    resolved_id = employees_map.get(str(employee_id), employee_id)
    
    print(resolved_id)
    area_stats = await task_repository.aggregate_tasks_area_wise(
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date,
        client_category=category_val
    )
    
    total_unique_clients = sum(s["unique_clients"] for s in area_stats.values())
    total_tasks = sum(
        sum(item["task_count"] for item in s["clients_with_tasks"]) 
        for s in area_stats.values()
    )
    
    # We are missing "total_clients_in_area" (total existing clients regardless of tasks)
    # The requirement asks for "total clients in that area".
    # This requires a separate aggregation on ClientRepository to get total clients per area for this employee.
    # Note: This might be expensive if many areas.
    
    # Get all clients for employee to count totals per area
    # Or reuse existing get_clients_grouped with AREA_WISE
    # But wait, get_clients_grouped returns dict of clients.
    
    # Ideally we'd do a quick count aggregation in ClientRepository, but reusing existing might be easiest for now
    _, _, _ = await get_clients_grouped(resolved_id, GroupByField.AREA_WISE, None)
    # Actually let's just make a specific call or optimize later.
    # For now, let's fetch all clients grouped by area to get totals
    # We only care about areas that appear in the task list OR all areas?
    # Usually "total clients in that area" implies context of the area shown.
    
    # Let's get total clients per area for the employee
    grouped_clients, _, _ = await client_repository.aggregate_clients_grouped(
        employee_id=resolved_id,
        group_field=GROUP_FIELD_MAPPING[GroupByField.AREA_WISE],
        client_category=None # Total clients regardless of category? or same filter?
        # Requirement: "get tasks for area wise visited unique clients along with total clients in that area"
        # It's ambiguous if total clients should also filtered by category.
        # Assuming YES to be consistent.
    )
    
    # Update area_stats with total_clients_in_area
    for area, stats in area_stats.items():
        total_in_area = 0
        if area in grouped_clients:
            total_in_area = len(grouped_clients[area])
        stats["total_clients_in_area"] = total_in_area
        
    return {
        "areas": area_stats,
        "total_unique_clients": total_unique_clients,
        "total_tasks": total_tasks
    }

async def get_clients_by_school_category(
    employee_id: str,
    start_date: date,
    end_date: date,
    client_category: Optional[TaskClientCategoryFilter] = None
) -> SchoolCategoryResponse:
    """
    API 3: Get clients grouped by schoolCategory from latest task.
    """
    category_val = client_category.value if client_category else None
    
    results = await task_repository.get_latest_tasks_grouped_by_school_category(
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date,
        client_category=category_val
    )
    
    hot_count = len(results["Hot"])
    cold_count = len(results["Cold"])
    warm_count = len(results["Warm"])
    no_info_count = len(results["NoInfo"])
    total = hot_count + cold_count + warm_count + no_info_count
    
    return {
        "hot": results["Hot"],
        "cold": results["Cold"],
        "warm": results["Warm"],
        "no_info": results["NoInfo"],
        "summary": {
            "hot_count": hot_count,
            "cold_count": cold_count,
            "warm_count": warm_count,
            "no_info_count": no_info_count,
            "total": total
        }
    }
