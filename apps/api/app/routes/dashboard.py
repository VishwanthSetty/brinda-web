"""
Dashboard Routes
Handles analytics and dashboard data
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.sale import SalesAnalytics, SalesSummary, RegionSales, ProductSales
from app.schemas.user import TokenData
from app.middleware.auth import get_any_authenticated_user

router = APIRouter()


@router.get("/analytics", response_model=SalesAnalytics)
async def get_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: TokenData = Depends(get_any_authenticated_user),
):
    """
    Get sales analytics for the dashboard.
    
    Returns summary statistics, sales by region, and sales by product.
    Requires authentication.
    """
    collection = db["sales"]
    products_collection = db["products"]
    
    # Calculate date range
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    # Query for sales in date range
    match_query = {
        "sale_date": {"$gte": start_date, "$lte": end_date}
    }
    
    # Aggregate for summary
    summary_pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total_amount"},
                "total_orders": {"$sum": 1},
                "total_quantity": {"$sum": "$quantity"},
            }
        },
    ]
    
    summary_result = await collection.aggregate(summary_pipeline).to_list(1)
    
    if summary_result:
        summary_data = summary_result[0]
        total_revenue = summary_data.get("total_revenue", 0)
        total_orders = summary_data.get("total_orders", 0)
        total_quantity = summary_data.get("total_quantity", 0)
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    else:
        total_revenue = 0
        total_orders = 0
        total_quantity = 0
        avg_order_value = 0
    
    summary = SalesSummary(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_quantity=total_quantity,
        average_order_value=avg_order_value,
    )
    
    # Aggregate by region
    region_pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": "$customer_region",
                "total_revenue": {"$sum": "$total_amount"},
                "total_orders": {"$sum": 1},
            }
        },
        {"$sort": {"total_revenue": -1}},
        {"$limit": 10},
    ]
    
    region_results = await collection.aggregate(region_pipeline).to_list(10)
    
    by_region = []
    for r in region_results:
        region_name = r["_id"] or "Unknown"
        percentage = (r["total_revenue"] / total_revenue * 100) if total_revenue > 0 else 0
        by_region.append(
            RegionSales(
                region=region_name,
                total_revenue=r["total_revenue"],
                total_orders=r["total_orders"],
                percentage=round(percentage, 2),
            )
        )
    
    # Aggregate by product
    product_pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": "$product_id",
                "total_revenue": {"$sum": "$total_amount"},
                "total_quantity": {"$sum": "$quantity"},
            }
        },
        {"$sort": {"total_revenue": -1}},
        {"$limit": 10},
    ]
    
    product_results = await collection.aggregate(product_pipeline).to_list(10)
    
    by_product = []
    for p in product_results:
        # Get product title
        try:
            from bson import ObjectId
            product_doc = await products_collection.find_one(
                {"_id": ObjectId(p["_id"])}
            )
            product_title = product_doc.get("title", "Unknown") if product_doc else "Unknown"
        except Exception:
            product_title = "Unknown"
        
        percentage = (p["total_revenue"] / total_revenue * 100) if total_revenue > 0 else 0
        by_product.append(
            ProductSales(
                product_id=str(p["_id"]),
                product_title=product_title,
                total_revenue=p["total_revenue"],
                total_quantity=p["total_quantity"],
                percentage=round(percentage, 2),
            )
        )
    
    return SalesAnalytics(
        summary=summary,
        by_region=by_region,
        by_product=by_product,
        period_start=start_date,
        period_end=end_date,
    )


@router.get("/summary")
async def get_quick_summary(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: TokenData = Depends(get_any_authenticated_user),
):
    """
    Get quick summary statistics for dashboard widgets.
    
    Returns counts of products, users, and today's sales.
    Requires authentication.
    """
    products_collection = db["products"]
    users_collection = db["users"]
    sales_collection = db["sales"]
    
    # Get counts
    total_products = await products_collection.count_documents({"is_active": True})
    total_users = await users_collection.count_documents({"is_active": True})
    
    # Today's sales
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    
    today_sales_pipeline = [
        {"$match": {"sale_date": {"$gte": today_start}}},
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total_amount"},
                "total_orders": {"$sum": 1},
            }
        },
    ]
    
    today_result = await sales_collection.aggregate(today_sales_pipeline).to_list(1)
    
    if today_result:
        today_revenue = today_result[0].get("total_revenue", 0)
        today_orders = today_result[0].get("total_orders", 0)
    else:
        today_revenue = 0
        today_orders = 0
    
    return {
        "total_products": total_products,
        "total_users": total_users,
        "today_revenue": today_revenue,
        "today_orders": today_orders,
    }
