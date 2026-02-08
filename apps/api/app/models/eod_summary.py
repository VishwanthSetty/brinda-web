"""
EOD Summary Database Model
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field

from app.schemas.unolo import UnoloEodSummaryResponse

class EodSummaryInDB(UnoloEodSummaryResponse):
    """EOD Summary model as stored in MongoDB."""
    id: str = Field(..., alias="_id")
    
    # Local timestamps for sync tracking
    created_at_local: datetime = Field(default_factory=datetime.utcnow)
    updated_at_local: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

    class MongoMeta:
        collection_name = "eod_summaries"
        indexes = [
            # Compound unique index on employeeID and date to prevent duplicates
            {"keys": [("employeeID", 1), ("date", 1)], "unique": True},
            {"keys": [("date", 1)]},
            {"keys": [("employeeID", 1)]},
            {"keys": [("internalEmpID", 1)]},
        ]
