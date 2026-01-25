"""
Task Schemas
Pydantic models for Task entities from Unolo API
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union

from pydantic import BaseModel, Field

class TaskBase(BaseModel):
    """Base Task model with common fields."""
    task_id: str = Field(..., alias="taskID", description="Unique Task ID")
    client_id: Optional[str] = Field(None, alias="clientID")
    employee_id: Optional[str] = Field(None, alias="employeeID")
    internal_emp_id: str = Field(..., alias="internalEmpID")
    task_date: date = Field(..., alias="date")
    checkin_time: Optional[datetime] = Field(None, alias="checkinTime")
    checkout_time: Optional[datetime] = Field(None, alias="checkoutTime")
    lat: Optional[float] = None
    lon: Optional[float] = None
    task_description: Optional[str] = Field(None, alias="taskDescription")
    address: Optional[str] = None
    custom_fields_complex: List[Dict[str, Any]] = Field(default_factory=list, alias="customFieldsComplex")
    custom_entity: Optional[Dict[str, Any]] = Field(None, alias="customEntity")
    
    # Audit fields from API
    created_by: Optional[str] = Field(None, alias="createdBy")
    created_by_name: Optional[str] = Field(None, alias="createdByName")
    last_modified_by: Optional[str] = Field(None, alias="lastModifiedBy")
    last_modified_by_name: Optional[str] = Field(None, alias="lastModifiedByName")
    metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")

    class Config:
        populate_by_name = True


class TaskCreate(TaskBase):
    """Model for creating a new task (used during sync)."""
    # Includes local audit fields if needed
    created_at_local: Optional[datetime] = None
    updated_at_local: Optional[datetime] = None


from app.schemas.client import Client

class Task(TaskBase):
    """Task model for API responses."""
    id: str = Field(..., alias="_id")
    
    # Local metadata
    created_at_local: Optional[datetime] = None
    updated_at_local: Optional[datetime] = None
    
    # Populated fields
    client: Optional[Client] = None
    
    class Config:
        from_attributes = True


class TaskList(BaseModel):
    """Paginated list of tasks."""
    data: List[Task]
    total: int
    limit: int
    skip: int


class TaskSyncResponse(BaseModel):
    """Response for task sync operation."""
    total_fetched: int
    created: int
    updated: int
    errors: int
