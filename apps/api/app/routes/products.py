"""
Products Routes
Handles book product operations
"""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.product import Product, ProductCreate, ProductUpdate, ProductList
from app.schemas.user import TokenData
from app.middleware.auth import get_current_user, get_manager_or_admin

router = APIRouter()


@router.get("", response_model=ProductList)
async def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title or author"),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    List all products with pagination.
    
    This is a public endpoint - no authentication required.
    """
    collection = db["products"]
    
    # Build query filter
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
        ]
    
    # Get total count
    total = await collection.count_documents(query)
    
    # Get paginated results
    skip = (page - 1) * page_size
    cursor = collection.find(query).skip(skip).limit(page_size).sort("title", 1)
    
    items = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        items.append(Product(**doc))
    
    return ProductList(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(skip + len(items)) < total,
    )


@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Get a single product by ID.
    
    This is a public endpoint - no authentication required.
    """
    collection = db["products"]
    
    try:
        doc = await collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format",
        )
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    doc["id"] = str(doc.pop("_id"))
    return Product(**doc)


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: TokenData = Depends(get_manager_or_admin),
):
    """
    Create a new product.
    
    Requires ADMIN or MANAGER role.
    """
    collection = db["products"]
    
    now = datetime.now(timezone.utc)
    
    product_doc = {
        **product_data.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    
    result = await collection.insert_one(product_doc)
    
    product_doc["id"] = str(result.inserted_id)
    return Product(**product_doc)


@router.patch("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: TokenData = Depends(get_manager_or_admin),
):
    """
    Update an existing product.
    
    Requires ADMIN or MANAGER role.
    """
    collection = db["products"]
    
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format",
        )
    
    # Get only non-None values
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await collection.find_one_and_update(
        {"_id": object_id},
        {"$set": update_data},
        return_document=True,
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    result["id"] = str(result.pop("_id"))
    return Product(**result)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: TokenData = Depends(get_manager_or_admin),
):
    """
    Delete a product (soft delete by setting is_active to False).
    
    Requires ADMIN or MANAGER role.
    """
    collection = db["products"]
    
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format",
        )
    
    result = await collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
