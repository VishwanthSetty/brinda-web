"""
Product Schemas
Pydantic models for book products
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    """Base product model with common fields."""
    title: str = Field(..., min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, pattern=r"^[\d\-]+$")
    author: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    stock_quantity: int = Field(default=0, ge=0)
    description: Optional[str] = Field(None, max_length=2000)
    cover_image_url: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    """Model for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Model for updating product details."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, pattern=r"^[\d\-]+$")
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    stock_quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=2000)
    cover_image_url: Optional[str] = None
    is_active: Optional[bool] = None


class Product(ProductBase):
    """Product model for API responses."""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductList(BaseModel):
    """Paginated list of products."""
    items: list[Product]
    total: int
    page: int
    page_size: int
    has_more: bool
