"""
User Schemas
Pydantic models for user management and authentication
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Any

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRole(str, Enum):
    """User roles for role-based access control."""
    ADMIN = "admin"
    MANAGER = "manager"
    SALES_REP = "sales_rep"


class UserBase(BaseModel):
    """Base user model with common fields."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.SALES_REP
    is_active: bool = True
    empId: Optional[str] = None
    employeeId: Optional[str] = None

    @field_validator("empId", "employeeId", mode="before")
    @classmethod
    def convert_to_string(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        return str(v)


class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Model for updating user details."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    empId: Optional[str] = None
    employeeId: Optional[str] = None

    @field_validator("empId", "employeeId", mode="before")
    @classmethod
    def convert_to_string(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        return str(v)


class User(UserBase):
    """User model for API responses (excludes sensitive data)."""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Authentication Schemas

class Token(BaseModel):
    """JWT token response model."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    empId: Optional[str] = None
    employeeId: Optional[str] = None

    @field_validator("empId", "employeeId", mode="before")
    @classmethod
    def convert_to_string(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        return str(v)


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str
