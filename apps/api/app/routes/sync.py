"""
Sync Routes
Centralized endpoints for syncing data from Unolo API.
"""
from typing import Dict, Any
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middleware.auth import get_manager_or_admin, get_admin_user
from app.external.unolo_client import get_unolo_client, UnoloClient, UnoloClientError

# Services
from app.services.task import sync_tasks
from app.services.employee import sync_employees
from app.services.eod_summary import sync_eod_summary
from app.services.attendance import sync_attendance
# Client sync logic is embedded in route, need to import necessary deps
from app.schemas.client import ClientMigrationResponse
# Wait, I can't import the route handler itself easily if it depends on Depends.
# I should probably move the logic to a service or copy it.
# Looking at clients.py, the logic is inline. I should extract it or copy it.
# To avoid circular imports if I extract to service now, I will copy duplicate logic 
# OR better, Refactor clients.py to have a service function `sync_modules.sync_clients_service`.
# But for now, I will copy the logic to keep it simple and safe, or try to import if possible.
# Actually, clients.py is a route file. Importing from it might cause circular imports if it imports other routes (unlikely but possible).
# Let's inspect clients.py again. It imports services.client.
# I will implement sync_clients here directly or use a service if available.
# The sync_clients in clients.py has meaningful logic. 
# I will copy the logic for now to avoid breaking existing structure too much, 
# or I can create `app/services/client_sync.py`? 
# Let's stick to putting it in here for now, refactoring logic to service is better but might be out of scope 
# if I want to just "move" the endpoint.
# Actually, the user asked to "get all sync apis in one file".
# So I should move the logic here.

from app.schemas.task import TaskSyncResponse
from app.schemas.unolo import SyncStatsResponse

router = APIRouter()

@router.post("/tasks", response_model=TaskSyncResponse)
async def sync_tasks_endpoint(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    custom_task_name: str = Query(..., alias="customTaskName", description="Task name to fetch"),
    current_user = Depends(get_manager_or_admin)
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


@router.post("/employees", response_model=Dict[str, Any])
async def sync_employees_endpoint(
    current_user = Depends(get_admin_user)
):
    """
    Sync employees from Unolo API to local database.
    Requires ADMIN role.
    """
    try:
        stats = await sync_employees()
        return stats
    except UnoloClientError as e:
        raise HTTPException(
            status_code=e.status_code or 500,
            detail=f"Failed to sync employees from Unolo: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during sync: {str(e)}"
        )


@router.post("/eod-summary", response_model=SyncStatsResponse)
async def sync_eod_summary_endpoint(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user = Depends(get_manager_or_admin)
):
    """
    Trigger sync of EOD summaries from Unolo API.
    """
    try:
        if end < start:
            raise HTTPException(status_code=400, detail="End date must be after start date")
            
        return await sync_eod_summary(start, end)
    except UnoloClientError as e:
        raise HTTPException(status_code=502, detail=f"External API Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/attendance", response_model=SyncStatsResponse)
async def sync_attendance_endpoint(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user = Depends(get_manager_or_admin)
):
    """
    Trigger sync of Attendance from Unolo API.
    """
    try:
        if end < start:
            raise HTTPException(status_code=400, detail="End date must be after start date")
            
        return await sync_attendance(start, end)
    except UnoloClientError as e:
        raise HTTPException(status_code=502, detail=f"External API Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# For clients, we need to replicate the logic since it's not in a simple service function yet.
# To keep this file clean, I'll extract the logic from clients.py into a service first
# or import it if I can make it importable.
# But wait, I can just copy the logic here. It's safe.

from datetime import datetime, timezone
from app.schemas.unolo import UnoloClientResponse
from app.repository.employee_repository import employee_repository

@router.post("/clients", response_model=ClientMigrationResponse)
async def sync_clients_endpoint(
    db: AsyncIOMotorDatabase = Depends(get_database),
    unolo_client: UnoloClient = Depends(get_unolo_client),
    current_user = Depends(get_manager_or_admin),
):
    """
    Sync clients from Unolo External API.
    """
    collection = db["clients"]
    
    try:
        clients_data_raw = await unolo_client.get_all_clients()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch clients from Unolo: {str(e)}")
    
    created_count = 0
    updated_count = 0
    errors = []
    
    now = datetime.now(timezone.utc)
    
    for item_raw in clients_data_raw:
        try:
            # Validate with Pydantic
            try:
                item = UnoloClientResponse(**item_raw)
            except Exception as e:
                errors.append(f"Validation error for item {item_raw.get('clientName', 'Unknown')}: {e}")
                continue

            unolo_id = item.client_id or item.internal_client_id
            
            if not unolo_id:
                errors.append(f"Skipping client without ID: {item.client_name}")
                continue
                
            c_name = item.contact_name or "N/A"
            c_number = item.contact_number or "N/A"
            
            if item.contact and " @ " in item.contact:
                parts = item.contact.split(" @ ")
                if len(parts) >= 2:
                    if c_name == "N/A": c_name = parts[0]
                    if c_number == "N/A": c_number = parts[1]

            client_doc = {
                "Client Name (*)": item.client_name,
                "Address (*)": item.address,
                "Latitude": item.lat,
                "Longitude": item.lng,
                "unolo_client_id": unolo_id,
                "Contact Name (*)": c_name,
                "Contact Number (*)": c_number,
                "Country Code (*)": item.country_code or "+91",
                "Visible To (*)": str(item.created_by_emp_id) if item.created_by_emp_id else "Admin", 
                "Client Catagory (*)": item.client_catagory or item.client_category or "Uncategorized",
                "Division Name new (*)": item.division_name_new or "General",
                "Using Material (*)": item.using_material or "No",
                "School Strength": item.school_strength,
                "Using IIT (*)": item.using_iit or "No",
                "Using AI (*)": "No",
                "Branches Places": item.branches_places,
                "Building": item.building,
                "Distributor Name": item.distributor_name,
                "Radius(m)": item.radius,
                "Otp Verified": bool(item.otp_verified) if item.otp_verified is not None else False,
            }
            
            existing = await collection.find_one({"unolo_client_id": unolo_id})

            if existing:
                # UPDATE
                update_fields = {k: v for k, v in client_doc.items() if v is not None}
                update_fields["Last Modified At"] = now
                
                await collection.update_one(
                    {"unolo_client_id": unolo_id},
                    {"$set": update_fields}
                )
                updated_count += 1
            else:
                # INSERT
                required_defaults = {
                     "Visible To (*)": "Admin", 
                     "Can exec change location (*)": True,
                     "Client Catagory (*)": "Uncategorized",
                     "Division Name new (*)": "General",
                     "Using Material (*)": "No",
                     "Using IIT (*)": "No",
                     "Using AI (*)": "No",
                     "Address (*)": "Unknown Address",
                     "Client Name (*)": f"Client {unolo_id}",
                     "Contact Name (*)": "N/A",
                     "Contact Number (*)": "N/A",
                     "Country Code (*)": "+91"
                }
                
                insert_doc = {**required_defaults, **client_doc}
                insert_doc["Created At"] = now
                insert_doc["Last Modified At"] = now
                
                await collection.insert_one(insert_doc)
                created_count += 1
                
        except Exception as e:
            error_msg = f"Error syncing client ID {item_raw.get('clientID')}: {str(e)}"
            errors.append(error_msg)
            
    return ClientMigrationResponse(
        total_processed=len(clients_data_raw),
        created_count=created_count,
        updated_count=updated_count,
        errors=errors
    )
