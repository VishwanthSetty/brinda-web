"""
Sale Database Models
"""

from datetime import datetime
from pydantic import Field

from app.schemas.sale import SaleBase

class SaleInDB(SaleBase):
    """Sale model as stored in database."""
    id: str = Field(..., alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True
