"""
Client Database Models
"""

from typing import Optional, Union

from pydantic import Field

from app.schemas.client import ClientBase

class ClientInDB(ClientBase):
    """Client model as stored in database."""
    # We use 'id' field from the Excel sheet as the primary identifier if provided,
    # otherwise we might rely on _id. However, the requirement is to update if ID exists.
    # Assuming 'ID' column maps to 'client_id' or similar in our logic, but let's call it 'id'
    # to match the alias. Note that 'id' in python is reserved, but pydantic handles it.
    unolo_client_id: Optional[Union[str, int]] = Field(None, alias="ID")
    
    # MongoDB _id checks
    _id: Optional[str] = None

    class Config:
        populate_by_name = True

    class MongoMeta:
        collection_name = "clients"
        indexes = [
            {"keys": [("ID", 1)]}
        ]
