"""
Client Schemas
Pydantic models for client management and migration
"""

from datetime import datetime
from typing import Optional, List, Union, Any

from pydantic import BaseModel, Field, field_validator


class ClientBase(BaseModel):
    """Base client model with common fields."""
    client_name: str = Field(..., alias="Client Name (*)")
    visible_to: str = Field(..., alias="Visible To (*)")
    employee_id: Optional[str] = Field(None, alias="Employee ID")
    contact_name: str = Field(..., alias="Contact Name (*)")
    country_code: str = Field(..., alias="Country Code (*)")
    contact_number: str = Field(..., alias="Contact Number (*)")
    address: str = Field(..., alias="Address (*)")
    can_exec_change_location: bool = Field(..., alias="Can exec change location (*)")
    latitude: Optional[float] = Field(None, alias="Latitude")
    longitude: Optional[float] = Field(None, alias="Longitude")
    radius_m: Optional[float] = Field(None, alias="Radius(m)")
    otp_verified: Optional[bool] = Field(None, alias="Otp Verified")
    created_by: Optional[str] = Field(None, alias="Created By")
    created_at: Optional[datetime] = Field(None, alias="Created At")
    last_modified_at: Optional[datetime] = Field(None, alias="Last Modified At")
    client_category: str = Field(..., alias="Client Catagory (*)")
    division_name_new: str = Field(..., alias="Division Name new (*)")
    correspondent_name: Optional[str] = Field(None, alias="Correspondent Name")
    correspondent_phone_number: Optional[str] = Field(None, alias="Corresponded Phone Number")
    head_master: Optional[str] = Field(None, alias="Head Master")
    hm_phone_number: Optional[str] = Field(None, alias="HM Phone Number")
    distributor_name: Optional[str] = Field(None, alias="Distributor Name")
    using_material: str = Field(..., alias="Using Material (*)")
    currently_used_brand: Optional[str] = Field(None, alias="Currently Used Brand")
    time_of_order_class_10: Optional[str] = Field(None, alias="Time of Order(Class 10)")
    time_of_order_class_6_9: Optional[str] = Field(None, alias="Time of Order(Class 6-9)")
    school_strength: Optional[int] = Field(None, alias="School Strength")
    using_iit: str = Field(..., alias="Using IIT (*)")
    using_ai: str = Field(..., alias="Using AI (*)")
    question_papers: Optional[str] = Field(None, alias="Question Papers")
    branches_places: Optional[str] = Field(None, alias="Branches Places")
    building: Optional[str] = Field(None, alias="Building")
    to_delete: Optional[bool] = Field(None, alias="To Delete")

    @field_validator("created_at", "last_modified_at", mode="before")
    @classmethod
    def parse_datetime(cls, v: Any) -> Optional[datetime]:
        if v is None or v == "":
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            # Try parsing custom format "23-01-2026 16:13:07"
            try:
                return datetime.strptime(v, "%d-%m-%Y %H:%M:%S")
            except ValueError:
                # Try validation ISO format or let pydantic default handle it
                pass
        return v

    @field_validator("school_strength", mode="before")
    @classmethod
    def parse_int_empty_string(cls, v: Any) -> Optional[int]:
        if v == "" or v == " ":
            return None
        return v

    class Config:
        populate_by_name = True


class ClientCreate(ClientBase):
    """Model for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Model for updating client details."""
    client_name: Optional[str] = Field(None, alias="Client Name (*)")
    visible_to: Optional[str] = Field(None, alias="Visible To (*)")
    contact_name: Optional[str] = Field(None, alias="Contact Name (*)")
    country_code: Optional[str] = Field(None, alias="Country Code (*)")
    contact_number: Optional[str] = Field(None, alias="Contact Number (*)")
    address: Optional[str] = Field(None, alias="Address (*)")
    can_exec_change_location: Optional[bool] = Field(None, alias="Can exec change location (*)")
    latitude: Optional[float] = Field(None, alias="Latitude")
    longitude: Optional[float] = Field(None, alias="Longitude")
    radius_m: Optional[float] = Field(None, alias="Radius(m)")
    otp_verified: Optional[bool] = Field(None, alias="Otp Verified")
    created_by: Optional[str] = Field(None, alias="Created By")
    created_at: Optional[datetime] = Field(None, alias="Created At")
    last_modified_at: Optional[datetime] = Field(None, alias="Last Modified At")
    client_category: Optional[str] = Field(None, alias="Client Catagory (*)")
    division_name_new: Optional[str] = Field(None, alias="Division Name new (*)")
    correspondent_name: Optional[str] = Field(None, alias="Correspondent Name")
    correspondent_phone_number: Optional[str] = Field(None, alias="Corresponded Phone Number")
    head_master: Optional[str] = Field(None, alias="Head Master")
    hm_phone_number: Optional[str] = Field(None, alias="HM Phone Number")
    distributor_name: Optional[str] = Field(None, alias="Distributor Name")
    using_material: Optional[str] = Field(None, alias="Using Material (*)")
    currently_used_brand: Optional[str] = Field(None, alias="Currently Used Brand")
    time_of_order_class_10: Optional[str] = Field(None, alias="Time of Order(Class 10)")
    time_of_order_class_6_9: Optional[str] = Field(None, alias="Time of Order(Class 6-9)")
    school_strength: Optional[int] = Field(None, alias="School Strength")
    using_iit: Optional[str] = Field(None, alias="Using IIT (*)")
    using_ai: Optional[str] = Field(None, alias="Using AI (*)")
    question_papers: Optional[str] = Field(None, alias="Question Papers")
    branches_places: Optional[str] = Field(None, alias="Branches Places")
    building: Optional[str] = Field(None, alias="Building")
    to_delete: Optional[bool] = Field(None, alias="To Delete")

    # Add validators here too if needed, but usually Update is partial.
    @field_validator("created_at", "last_modified_at", mode="before")
    @classmethod
    def parse_datetime(cls, v: Any) -> Optional[datetime]:
         if v is None or v == "":
            return None
         if isinstance(v, datetime):
            return v
         if isinstance(v, str):
            try:
                return datetime.strptime(v, "%d-%m-%Y %H:%M:%S")
            except ValueError:
                pass
         return v

    class Config:
        populate_by_name = True


class Client(ClientBase):
    """Client model for API responses."""
    unolo_client_id: Optional[Union[str, int]] = Field(None, alias="ID")
    mongo_id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True


# Migration Schemas

class ClientMigrationItem(ClientBase):
    """Item for bulk migration."""
    unolo_client_id: Optional[Union[str, int]] = Field(None, alias="ID")


class ClientMigrationRequest(BaseModel):
    """Request body for migration."""
    clients: List[ClientMigrationItem]


class ClientMigrationResponse(BaseModel):
    """Response summary for migration."""
    total_processed: int
    created_count: int
    updated_count: int
    errors: List[str] = []
