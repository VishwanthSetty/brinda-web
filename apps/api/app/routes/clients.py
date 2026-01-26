
"""
Client Routes
Handles client management and bulk data migration
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.client import ClientInDB
from app.schemas.client import (
    Client,
    ClientMigrationRequest,
    ClientMigrationResponse,
    ClientBase,
)
from app.services.client import get_clients
from app.repository.employee_repository import employee_repository

from app.middleware.auth import get_any_authenticated_user, get_admin_user, get_manager_or_admin

router = APIRouter()

@router.get("/")
async def list_clients(
    # Filters
    client_name: Optional[str] = Query(None, description="Filter by Client Name"),
    visible_to: Optional[str] = Query(None, description="Filter by Visible To"),
    contact_name: Optional[str] = Query(None, description="Filter by Contact Name"),
    contact_number: Optional[str] = Query(None, description="Filter by Contact Number"),
    created_by: Optional[str] = Query(None, description="Filter by Created By"),
    client_category: Optional[str] = Query(None, description="Filter by Client Category"),
    division_name_old: Optional[str] = Query(None, description="Filter by Division Name Old"),
    division_name_new: Optional[str] = Query(None, description="Filter by Division Name New"),
    correspondent_name: Optional[str] = Query(None, description="Filter by Correspondent Name"),
    correspondent_phone_number: Optional[str] = Query(None, description="Filter by Correspondent Phone Number"),
    head_master: Optional[str] = Query(None, description="Filter by Head Master"),
    hm_phone_number: Optional[str] = Query(None, description="Filter by HM Phone Number"),
    distributor_name: Optional[str] = Query(None, description="Filter by Distributor Name"),
    using_material: Optional[str] = Query(None, description="Filter by Using Material"),
    currently_used_brand: Optional[str] = Query(None, description="Filter by Currently Used Brand"),
    time_of_order_class_10: Optional[str] = Query(None, description="Filter by Time of Order (Class 10)"),
    time_of_order_class_6_9: Optional[str] = Query(None, description="Filter by Time of Order (Class 6-9)"),
    school_strength: Optional[int] = Query(None, description="Filter by School Strength"),
    using_iit: Optional[str] = Query(None, description="Filter by Using IIT"),
    using_ai: Optional[str] = Query(None, description="Filter by Using AI"),
    question_papers: Optional[str] = Query(None, description="Filter by Question Papers"),
    branches_places: Optional[str] = Query(None, description="Filter by Branches Places"),
    building: Optional[str] = Query(None, description="Filter by Building"),
    to_delete: Optional[bool] = Query(None, description="Filter by To Delete status"),
    
    # Date Ranges
    created_at_start: Optional[datetime] = Query(None, description="Start date for Created At"),
    created_at_end: Optional[datetime] = Query(None, description="End date for Created At"),
    last_modified_at_start: Optional[datetime] = Query(None, description="Start date for Last Modified At"),
    last_modified_at_end: Optional[datetime] = Query(None, description="End date for Last Modified At"),

    # Pagination
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    
    # Auth
    current_user = Depends(get_any_authenticated_user),
):
    """
    Get all clients with optional filters.
    Returns paginated response with total count.
    Requires authentication.
    """
    filters = {
        "client_name": client_name,
        "visible_to": visible_to,
        "contact_name": contact_name,
        "contact_number": contact_number,
        "created_by": created_by,
        "client_category": client_category,
        "division_name_old": division_name_old,
        "division_name_new": division_name_new,
        "correspondent_name": correspondent_name,
        "correspondent_phone_number": correspondent_phone_number,
        "head_master": head_master,
        "hm_phone_number": hm_phone_number,
        "distributor_name": distributor_name,
        "using_material": using_material,
        "currently_used_brand": currently_used_brand,
        "time_of_order_class_10": time_of_order_class_10,
        "time_of_order_class_6_9": time_of_order_class_6_9,
        "school_strength": school_strength,
        "using_iit": using_iit,
        "using_ai": using_ai,
        "question_papers": question_papers,
        "branches_places": branches_places,
        "building": building,
        "to_delete": to_delete,
        "created_at_start": created_at_start,
        "created_at_end": created_at_end,
        "last_modified_at_start": last_modified_at_start,
        "last_modified_at_end": last_modified_at_end,
    }
    
    clients, total = await get_clients(filters, limit, skip)
    
    return {
        "data": clients,
        "total": total,
        "limit": limit,
        "skip": skip
    }


@router.post("/", response_model=ClientMigrationResponse)
async def migrate_clients(
    request: ClientMigrationRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user = Depends(get_admin_user),
):
    """
    Bulk migrate clients.
    
    - If ID is present and exists in DB -> Update
    - If ID is not present or doesn't exist -> Insert
    - Populates employee_id based on visible_to field
    """
    collection = db["clients"]
    
    created_count = 0
    updated_count = 0
    errors = []
    
    now = datetime.now(timezone.utc)
    
    for item in request.clients:
        try:
            client_data = item.model_dump(by_alias=True, exclude_none=True)
            
            # Look up employee ID from visible_to field
            visible_to_value = client_data.get("Visible To (*)")
            employee_id = None
            if visible_to_value:
                employee_id = await employee_repository.get_employee_id_by_name(visible_to_value)
            
            # Add employee_id to client data
            if employee_id:
                client_data["Employee ID"] = employee_id
            
            unolo_id = item.unolo_client_id
            
            if unolo_id is not None:
                existing = await collection.find_one({"unolo_client_id": unolo_id})
                
                if existing:
                    # UPDATE
                    update_data = {
                        **client_data,
                        "unolo_client_id": unolo_id,
                        "Last Modified At": now, 
                    }
                    
                    if "ID" in update_data:
                        del update_data["ID"]
                    
                    if "Created At" not in update_data and "Created At" in existing:
                         pass 
                    
                    await collection.update_one(
                        {"unolo_client_id": unolo_id},
                        {"$set": update_data}
                    )
                    updated_count += 1
                    continue
            
            # INSERT
            insert_data = {
                **client_data,
                "unolo_client_id": unolo_id, # Can be None
                "Created At": client_data.get("Created At", now),
                "Last Modified At": now,
            }
            
            if "ID" in insert_data:
                del insert_data["ID"]
            
            await collection.insert_one(insert_data)
            created_count += 1
            
        except Exception as e:
            error_msg = f"Error processing client {item.client_name}: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
    
    print(f"Migration completed. Total: {len(request.clients)}, Created: {created_count}, Updated: {updated_count}, Errors: {len(errors)}")
    
    return ClientMigrationResponse(
        total_processed=len(request.clients),
        created_count=created_count,
        updated_count=updated_count,
        errors=errors
    )


from app.external.unolo_client import get_unolo_client, UnoloClient



@router.post("/sync", response_model=ClientMigrationResponse)
async def sync_clients(
    db: AsyncIOMotorDatabase = Depends(get_database),
    unolo_client: UnoloClient = Depends(get_unolo_client),
    current_user = Depends(get_manager_or_admin),
):
    """
    Sync clients from Unolo External API.
    Fetching all clients and upserting into local database.
    Matching based on unolo_client_id (clientID from API).
    """
    collection = db["clients"]
    
    try:
        clients_data = await unolo_client.get_all_clients()
        print(clients_data[1])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch clients from Unolo: {str(e)}")
    
    created_count = 0
    updated_count = 0
    errors = []
    
    now = datetime.now(timezone.utc)
    
    # Common mappings from typical Unolo API fields to our Schema Aliases
    # Since we use 'populate_by_name=True' and alias names in Pydantic, 
    # we can try to map API keys to our internal alias keys
    
    for item in clients_data:
        try:
            unolo_id = item.get("clientID") or item.get("id") or item.get("ID")
            
            if not unolo_id:
                # If no ID, we can't sync reliably
                errors.append(f"Skipping client without ID: {item.get('clientName', 'Unknown')}")
                continue
                
            # Convert ID to match stored format (likely string from API, but we store as is)
            # In migrate_clients we used item.unolo_client_id
            
            # Map fields
            # Note: We should ideally have a robust mapper, but here we do best effort
            # to populate required fields if they exist in the API response.
            # If the API returns raw custom fields, we might need adjustments.
            
            # Construct a dictionary compatible with our DB schema
            client_doc = {
                "Client Name (*)": item.get("clientName") or item.get("Client Name (*)"),
                "Address (*)": item.get("address") or item.get("Address (*)"),
                "Latitude": item.get("latitude") or item.get("lat"),
                "Longitude": item.get("longitude") or item.get("lon"),
                "unolo_client_id": unolo_id,
                
                # Fill other required fields with defaults or data if missing
                # Our Schema defines many required fields. If Unolo data is sparse, 
                # we might have issues creating VALID Client objects locally if we strict parse.
                # However, for MongoDB we can be flexible if we skip Pydantic validation 
                # OR we fill required with placeholders.
                
                # Let's map what we can find.
                "Contact Name (*)": item.get("contactName", "N/A"),
                "Contact Number (*)": item.get("contactNumber", "N/A"),
                "Country Code (*)": item.get("countryCode", "+91"),
                "Visible To (*)": str(item.get("employeeID", "")), # Mapping employeeID to visible to? Or separate?
                
                 # Custom fields often come in a list or dict in Unolo API
                # "Category": ...
            }
            
            # If specific keys exist in item, override
            # Unolo V2 might return `customEntity` or `customFields`
            
            # Merge raw item data to capture everything? 
            # We want to preserve existing data in DB if we are just updating status.
            
            existing = await collection.find_one({"unolo_client_id": unolo_id})

            if existing:
                # UPDATE
                # We only update fields that are present and not None/Empty in the new data
                # To avoid wiping out our local enriched data.
                
                update_fields = {k: v for k, v in client_doc.items() if v is not None}
                # Also add the raw API response as a backup field if needed? 
                # update_fields["unolo_raw_data"] = item 
                
                update_fields["Last Modified At"] = now
                
                await collection.update_one(
                    {"unolo_client_id": unolo_id},
                    {"$set": update_fields}
                )
                updated_count += 1
            else:
                # INSERT
                # We need to ensure we have enough checks for required fields if we rely on the app to read it.
                # Use default Placeholders for required fields if missing
                
                required_defaults = {
                     "Visible To (*)": "Admin", # Default assign
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
            error_msg = f"Error syncing client ID {item.get('clientID')}: {str(e)}"
            # logger.error(error_msg)
            errors.append(error_msg)
            
    return ClientMigrationResponse(
        total_processed=len(clients_data),
        created_count=created_count,
        updated_count=updated_count,
        errors=errors
    )
