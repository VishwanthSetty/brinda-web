"""
Webhook Routes
Handles incoming webhooks from external services like Unolo
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
import logging

from fastapi import APIRouter, Header, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.database import get_database
from app.schemas.unolo import UnoloClientResponse, UnoloTaskWebhook
from app.config import get_settings
from pydantic import ValidationError

router = APIRouter()
logger = logging.getLogger("webhooks")


async def verify_webhook_secret(x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret")):
    """
    Verify the webhook secret header matches our configured secret.
    Returns True if valid, raises HTTPException if invalid.
    """
    settings = get_settings()
    expected_secret = getattr(settings, 'webhook_secret', None)
    
    if expected_secret and x_webhook_secret != expected_secret:
        logger.warning("Webhook request with invalid secret")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret"
        )
    return True


def parse_dt(dt_val):
    """
    Parse datetime value and return ISO formatted string.
    Target format: 2026-02-02T17:29:38.507+00:00
    """
    if dt_val is None: return None
    
    dt_obj = None
    
    if isinstance(dt_val, (int, float)):
        try:
            ts = float(dt_val)
            # Heuristic for ms vs seconds
            if ts > 1e11:
                ts /= 1000.0
            dt_obj = datetime.fromtimestamp(ts, timezone.utc)
        except Exception:
            return None
    
    elif isinstance(dt_val, str):
        try:
            # Replace Z with +00:00 for consistency if needed
            dt_obj = datetime.fromisoformat(dt_val.replace('Z', '+00:00'))
        except ValueError:
            return dt_val # Return strict string if parse fails?
            
    elif isinstance(dt_val, datetime):
        dt_obj = dt_val
        
    if dt_obj:
        return dt_obj.isoformat(timespec='milliseconds')
        
    return None


async def process_client_webhook_data(client_data: Dict[str, Any], db) -> Dict[str, Any]:
    """
    Process a single client webhook payload and create/update client in database.
    Returns result dict with action taken.
    """
    collection = db["clients"]
    now = datetime.now(timezone.utc)
    
    try:
        # Validate incoming data using the UnoloClientResponse schema
        item = UnoloClientResponse.model_validate(client_data)
    except ValidationError as e:
        logger.error(f"Validation error for client webhook: {e}")
        return {"success": False, "error": f"Validation error: {str(e)}"}
    
    unolo_id = item.client_id
    if not unolo_id:
        return {"success": False, "error": "Missing clientID in payload"}
    
    # Extract contact info
    c_name = item.contact_name or "N/A"
    c_number = item.contact_number or "N/A"
    
    if item.contact and " @ " in item.contact:
        parts = item.contact.split(" @ ")
        if len(parts) >= 2:
            if c_name == "N/A":
                c_name = parts[0]
            if c_number == "N/A":
                c_number = parts[1]
    
    # Format timestamps
    # The original code constructed a specific dict mapping. 
    # Let's preserve that mapping but ensure values are formatted.
    
    # We need to use values from 'item' which now has strings for IDs.
    
    client_db_doc = {
        "Client Name (*)": item.client_name,
        "Address (*)": item.address,
        "Latitude": item.lat,
        "Longitude": item.lng,
        "unolo_client_id": str(unolo_id),
        
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
        "Email": item.email,
        "City": item.city,
        "Pincode": item.pin_code or item.pincode,
        
        # Add formatted timestamps if available in item
        # The schema has timestamp, created_ts, last_modified_ts
        # We should map them?
        "unolo_timestamp": parse_dt(item.timestamp),
        "unolo_created_ts": parse_dt(item.created_ts),
        "unolo_last_modified_ts": parse_dt(item.last_modified_ts),
    }
    
    # Clean up none values? Original code did:
    # update_fields = {k: v for k, v in client_doc.items() if v is not None}
    
    existing = await collection.find_one({"unolo_client_id": str(unolo_id)})
    
    if existing:
        # UPDATE
        update_fields = {k: v for k, v in client_db_doc.items() if v is not None}
        update_fields["Last Modified At"] = now
        
        await collection.update_one(
            {"unolo_client_id": str(unolo_id)},
            {"$set": update_fields}
        )
        logger.info(f"Webhook: Updated client {unolo_id}")
        return {"success": True, "action": "updated", "client_id": unolo_id}
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
        
        insert_doc = {**required_defaults, **client_db_doc}
        # Remove None values
        insert_doc = {k: v for k, v in insert_doc.items() if v is not None}
        
        insert_doc["Created At"] = now
        insert_doc["Last Modified At"] = now
        
        await collection.insert_one(insert_doc)
        logger.info(f"Webhook: Created client {unolo_id}")
        return {"success": True, "action": "created", "client_id": unolo_id}


async def process_task_webhook_data(task_data: Dict[str, Any], db) -> Dict[str, Any]:
    """
    Process a single task webhook payload and create/update task in database.
    """
    collection = db["tasks"]
    now = datetime.now(timezone.utc)
    
    try:
        # Validate using schema
        item = UnoloTaskWebhook.model_validate(task_data)
    except ValidationError as e:
        logger.error(f"Validation error for task webhook: {e}")
        return {"success": False, "error": f"Validation error: {str(e)}"}
        
    task_id = item.task_id
    
    # Convert string dates/times to objects if necessary
    # The schema defines them as strings/float, but we might want datetime objects in DB
    # matching the internal TaskInDB model.
    # For now, let's keep them as provided or convert if strict formats are known.
    # The TaskInDB model expects datetime for checkinTime/checkoutTime but Unolo sends strings?
    # Usually Unolo sends ISO strings. Let's try to parse them if possible or store as is
    # if the database allows flexible schema. 
    # However, app.schemas.task.TaskBase defines checkinTime as Optional[datetime].
    # So we should convert.
            
    # Prepare document from validated item
    # We want to use the structure from TaskBase/TaskInDB as much as possible
    
    task_doc = item.model_dump(by_alias=True, exclude_unset=False)
    
    # Explicitly convert IDs to strings
    if "employeeID" in task_doc and task_doc["employeeID"] is not None:
        task_doc["employeeID"] = str(task_doc["employeeID"])
    if "internalEmpID" in task_doc and task_doc["internalEmpID"] is not None:
        task_doc["internalEmpID"] = str(task_doc["internalEmpID"])
    
    # Fix dates
    if item.checkin_time is not None:
        task_doc["checkinTime"] = parse_dt(item.checkin_time)
            
    if item.checkout_time is not None:
        task_doc["checkoutTime"] = parse_dt(item.checkout_time)
            
    # Convert createdTs / lastModifiedTs if they exist in schema and payload?
    # Task schema doesn't strictly define them as int/str/float union in Base, 
    # but likely unolo sends them as int.
    # UnoloTaskWebhook (in unolo.py) has no created_ts etc fields defined locally, checks TaskBase?
    # TaskBase: created_by, created_by_name... doesn't have timestamps from Unolo except usually in metadata?
    # Wait, the user payload had "createdTs": 1770957322716.
    # UnoloTaskWebhook should probably accept those if we want to store them.
    # But for now I'll just focus on what's defined.
    
    # Ensure date is stored as needed, usually string YYYY-MM-DD is fine for "date" field
    
    # Add local timestamps
    task_doc["updated_at_local"] = now
    
    existing = await collection.find_one({"taskID": task_id})
    
    if existing:
        # UPDATE
        await collection.update_one(
            {"taskID": task_id},
            {"$set": task_doc}
        )
        logger.info(f"Webhook: Updated task {task_id}")
        return {"success": True, "action": "updated", "task_id": task_id}
    else:
        # INSERT
        task_doc["created_at_local"] = now
        # If _id is not provided, Mongo will generate one.
        # But if we want taskID to be the _id, we could set it.
        # exact model `TaskInDB` uses `id: str = Field(..., alias="_id")`
        # but in MongoMeta it sets unique index on `taskID`.
        # So we'll rely on Mongo's _id and keep taskID as a field.
        
        await collection.insert_one(task_doc)
        logger.info(f"Webhook: Created task {task_id}")
        return {"success": True, "action": "created", "task_id": task_id}


@router.post("/clients")
async def receive_client_webhook(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret"),
):
    """
    Receive webhook from Unolo when a client is created or edited.
    Supports both single object and list of objects.
    
    Expected Headers:
        - X-Webhook-Secret: Your configured webhook secret for authentication
    
    Expected Body:
        - JSON payload with client data from Unolo (single dict or list of dicts)
    """
    # Verify webhook secret if configured
    settings = get_settings()
    expected_secret = getattr(settings, 'webhook_secret', None)
    
    if expected_secret and x_webhook_secret != expected_secret:
        logger.warning(f"Webhook request with invalid secret: provided='{x_webhook_secret}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret"
        )
    
    # Parse request body
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook JSON: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    
    logger.info(f"Received client webhook with type: {type(payload)}")
    
    # Get database connection
    db = await get_database()
    
    results = []
    
    # Handle list of clients
    if isinstance(payload, list):
        for item in payload:
            res = await process_client_webhook_data(item, db)
            results.append(res)
    elif isinstance(payload, dict):
        # Handle single client
        res = await process_client_webhook_data(payload, db)
        results.append(res)
    else:
        logger.error(f"Invalid payload type: {type(payload)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid payload format. Expected list or dict."
        )
    
    # Check for failures
    failures = [r for r in results if not r["success"]]
    successes = [r for r in results if r["success"]]
    
    if failures:
        logger.warning(f"Client webhook processed with {len(failures)} errors out of {len(results)} items.")
        pass # Return success if at least some processed or to avoid indefinite retries of bad data
    
    return {
        "status": "success",
        "processed": len(results),
        "success_count": len(successes),
        "failure_count": len(failures),
        "details": results
    }


@router.post("/tasks")
async def receive_task_webhook(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret"),
):
    """
    Receive webhook from Unolo when a task is created or edited.
    Supports both single object and list of objects.
    """
    # Verify webhook secret
    await verify_webhook_secret(x_webhook_secret)
    
    # Parse body
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse task webhook JSON: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
        
    logger.info(f"Received task webhook with type: {type(payload)}")
    
    db = await get_database()
    
    results = []
    
    # Handle list of tasks
    if isinstance(payload, list):
        for item in payload:
            res = await process_task_webhook_data(item, db)
            results.append(res)
    elif isinstance(payload, dict):
        # Handle single task
        res = await process_task_webhook_data(payload, db)
        results.append(res)
    else:
        logger.error(f"Invalid payload type: {type(payload)}")
        raise HTTPException(status_code=422, detail="Invalid payload format. Expected list or dict.")
    
    # Check for failures
    failures = [r for r in results if not r["success"]]
    successes = [r for r in results if r["success"]]
    
    if failures:
        logger.warning(f"Task webhook processed with {len(failures)} errors out of {len(results)} items.")
        # If all failed, return error? Or partial success?
        # Typically webhooks equate 200 OK with "received". 
        # But if we want Unolo to retry, we should return non-200.
        # Use simple logic: if ANY failed, return 422? Or only if ALL failed?
        # Let's log errors but return success if at least one worked? 
        # Or return 422 to force retry?
        # Unolo might retry the whole batch. 
        # If we return 422, it might retry identical payload.
        # Safest is to return 200 if we processed at least one, or if it's a data validation error we can't fix.
        # But if it's a transient error, we want retry.
        # Given the "validation error" nature, retrying won't fix it unless code changes.
        # So return 200 to acknowledge receipt and log errors effectively.
        pass

    return {
        "status": "success",
        "processed": len(results),
        "success_count": len(successes),
        "failure_count": len(failures),
        "details": results
    }
