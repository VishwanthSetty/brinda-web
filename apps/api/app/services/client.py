
from typing import List, Optional, Any, Dict, Tuple
from datetime import datetime
from app.schemas.client import Client
from app.repository.client_repository import client_repository

# Mapping from snake_case parameter to DB field alias
FIELD_MAPPING = {
    "client_name": "Client Name (*)",
    "visible_to": "Visible To (*)",
    "contact_name": "Contact Name (*)",
    "contact_number": "Contact Number (*)",
    "created_by": "Created By",
    #"created_at": "Created At", # Handled specially
    #"last_modified_at": "Last Modified At", # Handled specially
    "client_category": "Client Catagory (*)",
    "division_name_old": "Division Name old",
    "division_name_new": "Division Name new (*)",
    "correspondent_name": "Correspondent Name",
    "correspondent_phone_number": "Corresponded Phone Number",
    "head_master": "Head Master",
    "hm_phone_number": "HM Phone Number",
    "distributor_name": "Distributor Name",
    "using_material": "Using Material (*)",
    "currently_used_brand": "Currently Used Brand",
    "time_of_order_class_10": "Time of Order(Class 10)",
    "time_of_order_class_6_9": "Time of Order(Class 6-9)",
    "school_strength": "School Strength",
    "using_iit": "Using IIT (*)",
    "using_ai": "Using AI (*)",
    "question_papers": "Question Papers",
    "branches_places": "Branches Places",
    "building": "Building",
    "to_delete": "To Delete"
}

async def get_clients(
    # db: AsyncIOMotorDatabase, # DB dependency removed
    filters: Dict[str, Any],
    limit: int = 100,
    skip: int = 0
) -> Tuple[List[Client], int]:
    """
    Retrieve clients with filters.
    Returns tuple of (clients list, total count).
    """
    query = {}
    
    # Process standard fields
    for param_key, db_key in FIELD_MAPPING.items():
        if filters.get(param_key) is not None:
            value = filters[param_key]
            if isinstance(value, str):
                query[db_key] = {"$regex": value, "$options": "i"}
            else:
                query[db_key] = value

    # Process Date Ranges
    created_start = filters.get("created_at_start")
    created_end = filters.get("created_at_end")
    if created_start or created_end:
        date_query = {}
        if created_start:
            date_query["$gte"] = created_start
        if created_end:
            date_query["$lte"] = created_end
        query["Created At"] = date_query

    modified_start = filters.get("last_modified_at_start")
    modified_end = filters.get("last_modified_at_end")
    if modified_start or modified_end:
        date_query = {}
        if modified_start:
            date_query["$gte"] = modified_start
        if modified_end:
            date_query["$lte"] = modified_end
        query["Last Modified At"] = date_query

    # Use Repository
    return await client_repository.find_with_filters(query, skip, limit)

