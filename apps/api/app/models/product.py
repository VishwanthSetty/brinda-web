"""
Product Database Models
"""

from datetime import datetime
from pydantic import Field

from app.schemas.product import ProductBase

class ProductInDB(ProductBase):
    """Product model as stored in database."""
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
