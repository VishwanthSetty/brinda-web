"""
Sale Schemas
Pydantic models for sales records and analytics
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SaleBase(BaseModel):
    """Base sale model with common fields."""
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    total_amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_region: Optional[str] = Field(None, max_length=100)
    sales_rep_id: str
    sale_date: datetime


class SaleCreate(BaseModel):
    """Model for creating a new sale record."""
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_region: Optional[str] = Field(None, max_length=100)
    sale_date: Optional[datetime] = None  # Defaults to now if not provided


class Sale(SaleBase):
    """Sale model for API responses."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Analytics Schemas

class SalesSummary(BaseModel):
    """Summary statistics for sales analytics."""
    total_revenue: float
    total_orders: int
    total_quantity: int
    average_order_value: float
    currency: str = "INR"


class RegionSales(BaseModel):
    """Sales breakdown by region."""
    region: str
    total_revenue: float
    total_orders: int
    percentage: float


class ProductSales(BaseModel):
    """Sales breakdown by product."""
    product_id: str
    product_title: str
    total_revenue: float
    total_quantity: int
    percentage: float


class SalesAnalytics(BaseModel):
    """Complete sales analytics response."""
    summary: SalesSummary
    by_region: list[RegionSales]
    by_product: list[ProductSales]
    period_start: datetime
    period_end: datetime
