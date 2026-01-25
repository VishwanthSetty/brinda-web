"""
Task Database Model
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field

from app.schemas.task import TaskBase
from app.schemas.client import Client

class TaskInDB(TaskBase):
    """Task model as stored in MongoDB."""
    id: str = Field(..., alias="_id")
    
    # Local timestamps for sync tracking
    created_at_local: datetime = Field(default_factory=datetime.utcnow)
    updated_at_local: datetime = Field(default_factory=datetime.utcnow)
    
    # Populated via aggregation lookup
    client: Optional[Client] = None

    class Config:
        populate_by_name = True

    class MongoMeta:
        collection_name = "tasks"
        indexes = [
            {"keys": [("taskID", 1)], "unique": True},
            {"keys": [("date", 1)]},
            {"keys": [("employeeID", 1)]},
            {"keys": [("internalEmpID", 1)]},
            {"keys": [("customEntity.customEntityName", 1)]},
        ]
