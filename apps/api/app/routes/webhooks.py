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
from app.schemas.unolo import UnoloClientResponse
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
    
    # Construct client document
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
        "Email": item.email,
        "City": item.city,
        "Pincode": item.pin_code or item.pincode,
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
        
        insert_doc = {**required_defaults, **client_doc}
        insert_doc["Created At"] = now
        insert_doc["Last Modified At"] = now
        
        await collection.insert_one(insert_doc)
        logger.info(f"Webhook: Created client {unolo_id}")
        return {"success": True, "action": "created", "client_id": unolo_id}


@router.post("/clients")
async def receive_client_webhook(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret"),
):
    """
    Receive webhook from Unolo when a client is created or edited.
    
    Expected Headers:
        - X-Webhook-Secret: Your configured webhook secret for authentication
    
    Expected Body:
        - JSON payload with client data from Unolo
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
    
    logger.info(f"Received client webhook: {payload}")
    
    # Get database connection
    db = await get_database()
    
    # Process the client data
    result = await process_client_webhook_data(payload, db)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result.get("error", "Failed to process client webhook")
        )
    
    return {
        "status": "success",
        "action": result.get("action"),
        "client_id": result.get("client_id"),
        "message": f"Client {result.get('action')} successfully"
    }
