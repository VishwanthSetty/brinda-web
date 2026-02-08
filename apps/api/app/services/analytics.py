"""
Analytics Service
"""

from datetime import date
from typing import Optional, Tuple, List, Dict
from app.repository.client_repository import client_repository
from app.repository.task_repository import task_repository
from app.schemas.client import Client
from app.schemas.task import Task
from app.schemas.analytics import (
    ClientCategoryFilter, 
    GroupByField, 
    TaskClientCategoryFilter,
    TaskAnalyticsResponse,
    AreaWiseTasksResponse,
    SchoolCategoryResponse,
    CategorySummary,
    AdminOverviewResponse
)
from app.services.employee import get_all_employees

# Mapping ENUMs to actual DB field names
CLIENT_CATEGORY_FIELD = "Client Catagory (*)"

GROUP_FIELD_MAPPING = {
    GroupByField.AREA_WISE: "Division Name new (*)",
    GroupByField.MATERIAL: "Using Material (*)"
}


# Default data for unknown/deleted clients
UNKNOWN_CLIENT_DATA = {
    "Client Name (*)": "Unknown Client",
    "Visible To (*)": "Admin",
    "Contact Name (*)": "Unknown",
    "Country Code (*)": "+91",
    "Contact Number (*)": "0000000000",
    "Address (*)": "Unknown",
    "Can exec change location (*)": False,
    "Latitude": 0.0,
    "Longitude": 0.0,
    "Radius(m)": 0.0,
    "Otp Verified": False,
    "Client Catagory (*)": "Unknown",
    "Division Name new (*)": "Unknown",
    "Using Material (*)": "Unknown",
    "Using IIT (*)": "No",
    "Using AI (*)": "No",
    "To Delete": False
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
    
    # Handle missing clients
    for task in tasks:
        if not task.client and task.client_id:
            task.client = Client(**UNKNOWN_CLIENT_DATA)
            task.client.unolo_client_id = task.client_id
            
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
    
    # Handle missing areas/clients
    if None in area_stats:
        area_stats["Unknown Area"] = area_stats.pop(None)
        
    for area, stats in area_stats.items():
        for client_info in stats["clients_with_tasks"]:
             if not client_info.get("client_name"):
                 client_info["client_name"] = "Unknown Client"
                 
    total_unique_clients = sum(s["unique_clients"] for s in area_stats.values())
    total_tasks = sum(
        sum(item["task_count"] for item in s["clients_with_tasks"]) 
        for s in area_stats.values()
    )
    
    # Aggregation for total clients in area
    _, _, _ = await get_clients_grouped(resolved_id, GroupByField.AREA_WISE, None)
    
    grouped_clients, _, _ = await client_repository.aggregate_clients_grouped(
        employee_id=resolved_id,
        group_field=GROUP_FIELD_MAPPING[GroupByField.AREA_WISE],
        client_category=None 
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
    
    # Ensure missing client tasks land in NoInfo or handled
    # The aggregation might already put them in NoInfo if category is missing
    # We can check specific buckets if needed, but assuming aggregation handles null category -> NoInfo
    
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

async def get_admin_dashboard_overview(
    start_date: date,
    end_date: date
) -> "AdminOverviewResponse":
    """
    Get admin dashboard overview with aggregated stats and per-employee breakdowns.
    """
    # 1. Fetch all tasks in date range for total counts and specimen calc
    all_tasks = await task_repository.find_all_tasks_in_date_range(start_date, end_date)
    
    total_tasks = len(all_tasks)
    
    # Calculate total specimens
    total_specimens = 0
    for task in all_tasks:
        if task.metadata:
            # metadata is a dict, use .get()
            specimens = task.metadata.get("specimensGiven")
            if specimens:
                try:
                    val = int(specimens)
                    total_specimens += val
                except (ValueError, TypeError):
                    pass

    # 2. Fetch Aggregated Task Counts by Employee
    task_counts = await task_repository.aggregate_tasks_by_employee(start_date, end_date)
    # Map to dict for easy lookup
    task_map = {item["_id"]: item["count"] for item in task_counts if item["_id"]}
    
    # 3. Fetch Hot Schools Counts by Employee
    hot_school_counts = await task_repository.get_hot_schools_by_employee(start_date, end_date)
    # Map to dict
    hot_school_map = {item["_id"]: item["count"] for item in hot_school_counts if item["_id"]}
    
    total_hot_schools = sum(item["count"] for item in hot_school_counts)
    
    # 4. Get all employees to resolve names
    employees = await get_all_employees()
    
    # Build response lists
    tasks_by_employee = []
    schools_by_employee = []
    
    for emp in employees:
        eid = str(emp.get("employeeID", ""))
        name = emp.get("empName", "Unknown")
        
        # Task Count using employeeID
        count = task_map.get(eid, 0)
        
        if count > 0:
            tasks_by_employee.append({
                "employee_id": eid,
                "employee_name": name,
                "task_count": count
            })
            
        # Hot School Count
        hot_count = hot_school_map.get(eid, 0)
        if hot_count > 0:
            schools_by_employee.append({
                "employee_id": eid,
                "employee_name": name,
                "hot_school_count": hot_count
            })
            
    # Sort by count descending
    tasks_by_employee.sort(key=lambda x: x["task_count"], reverse=True)
    schools_by_employee.sort(key=lambda x: x["hot_school_count"], reverse=True)
    
    return {
        "total_tasks": total_tasks,
        "hot_schools_count": total_hot_schools,
        "total_specimens": total_specimens,
        "tasks_by_employee": tasks_by_employee,
        "schools_by_employee": schools_by_employee
    }

async def get_admin_tasks_drilldown(
    start_date: date,
    end_date: date,
    employee_id: Optional[str] = None,
    filter_type: Optional[str] = None
) -> TaskAnalyticsResponse:
    """
    Get detailed tasks for admin drill-down.
    """
    tasks_raw = await task_repository.find_all_tasks_with_clients(start_date, end_date, employee_id, filter_type)
    
    # Map to schemas
    data = []
    for t in tasks_raw:
        if not t.client and t.client_id:
             t.client = Client(**UNKNOWN_CLIENT_DATA)
             t.client.unolo_client_id = t.client_id
             
        data.append(Task(**t.dict(by_alias=True)))
        
    return TaskAnalyticsResponse(
        total=len(data),
        data=data
    )
