"""
User Database Models
"""

from datetime import datetime
from typing import Optional, Any
from pydantic import Field, field_validator

from app.schemas.user import UserBase

class UserInDB(UserBase):
    """User model as stored in database."""
    id: str = Field(..., alias="_id")
    password_hash: str
    empId: Optional[str] = None
    employeeId: Optional[str] = None

    @field_validator("empId", "employeeId", mode="before")
    @classmethod
    def convert_to_string(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        return str(v)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True

    class MongoMeta:
        collection_name = "users"
        indexes = [
            {"keys": [("email", 1)], "unique": True},
            {"keys": [("empId", 1)]},
            {"keys": [("employeeId", 1)]},
        ]
