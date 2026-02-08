"""
Attendance Database Model
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field

from app.schemas.unolo import UnoloAttendanceResponse

class AttendanceInDB(UnoloAttendanceResponse):
    """Attendance model as stored in MongoDB."""
    id: str = Field(..., alias="_id")
    
    # Local timestamps for sync tracking
    created_at_local: datetime = Field(default_factory=datetime.utcnow)
    updated_at_local: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

    class MongoMeta:
        collection_name = "attendance"
        indexes = [
            # Compound unique index on userID and date? 
            # Or employeeID and date? The response has 'userID' and 'internalEmpID'.
            # Taking a cue from other models, let's use employeeID if available or userID?
            # UnoloAttendanceResponse has internalEmpID (optional) and userID (required).
            # It DOES NOT seem to have a top-level numeric 'employeeID' like EOD Summary?
            # Wait, let's check the schema again.
            # UnoloAttendanceResponse -> first_name, last_name, internalEmpID, userID...
            # The 'attendanceEvents' dict values have 'employeeID'.
            # But the top level object represents a person.
            # Let's use userID + date as unique key.
            {"keys": [("userID", 1), ("date", 1)], "unique": True},
            {"keys": [("date", 1)]},
            {"keys": [("internalEmpID", 1)]},
            # Index for querying by date range
            {"keys": [("date", 1), ("internalEmpID", 1)]},
        ]
