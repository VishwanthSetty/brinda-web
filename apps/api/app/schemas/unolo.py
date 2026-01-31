from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, Field, field_validator

class UnoloVisibility(BaseModel):
    type: str
    value: int

class UnoloClientResponse(BaseModel):
    client_id: Optional[str] = Field(None, validation_alias="clientID")
    # Support both capitalizations just in case, though the first one is from the first payload
    # The second payload had "clientId", but "clientID" was in the first big blob.
    # Pydantic's validation_alias can take a list or we can just rely on the primary one
    # provided in the real data. I'll stick to the first blob's conventions for now 
    # and add the user's second blob fields.
    
    company_id: Optional[int] = Field(None, alias="companyID")
    client_name: Optional[str] = Field(None, alias="clientName")
    lat: Optional[float] = Field(None)
    lng: Optional[float] = Field(None)
    description: Optional[str] = Field(None)
    timestamp: Optional[int] = Field(None)
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    address: Optional[str] = Field(None)
    proprietor_name: Optional[str] = Field(None, alias="proprietorName")
    photo_path: Optional[str] = Field(None, alias="photoPath")
    radius: Optional[int] = Field(None)
    can_override: Optional[Union[int, bool]] = Field(None, alias="canOverride")
    orig_lat: Optional[float] = Field(None, alias="origLat")
    orig_lon: Optional[float] = Field(None, alias="origLon")
    email: Optional[str] = Field(None)
    internal_client_id: Optional[str] = Field(None, alias="internalClientID")
    city: Optional[str] = Field(None)
    pin_code: Optional[Union[str, int]] = Field(None, alias="pinCode")
    pincode: Optional[Union[str, int]] = Field(None) # From second request
    
    polyline: Optional[Any] = Field(None)
    site_type: Optional[int] = Field(None, alias="siteType")
    job_type_id: Optional[int] = Field(None, alias="jobTypeID")
    client_cat: Optional[Any] = Field(None, alias="clientCat")
    
    # Tracking fields
    created_by_admin_id: Optional[int] = Field(None, alias="createdByAdminID")
    created_by_emp_id: Optional[int] = Field(None, alias="createdByEmpID")
    created_by_source_id: Optional[int] = Field(None, alias="createdBySourceID")
    created_ts: Optional[int] = Field(None, alias="createdTs")
    last_modified_by_emp_id: Optional[int] = Field(None, alias="lastModifiedByEmpID")
    last_modified_by_admin_id: Optional[int] = Field(None, alias="lastModifiedByAdminID")
    last_modified_by_source_id: Optional[int] = Field(None, alias="lastModifiedBySourceID")
    last_modified_ts: Optional[int] = Field(None, alias="lastModifiedTs")
    
    otp_verified: Optional[Union[int, bool]] = Field(None, alias="otpVerified")
    is_duplicate: Optional[bool] = Field(None, alias="isDuplicate")
    
    # Complex fields
    visibility: Optional[List[UnoloVisibility]] = Field(None)
    
    # Custom fields inferred from request
    distributor_name: Optional[str] = Field(None, alias="distributorName")
    contact: Optional[str] = Field(None) # "Name @ Number"
    client_catagory: Optional[str] = Field(None, alias="clientCatagory") # Spelling in API?
    client_category: Optional[str] = Field(None, alias="clientCategory") # Spelling in second request
    division_name_new: Optional[str] = Field(None, alias="divisionNameNew")
    using_material: Optional[str] = Field(None, alias="usingMaterial")
    
    # Additional fields request
    school_strength: Optional[Union[int, str]] = Field(None, alias="schoolStrength")
    using_iit: Optional[str] = Field(None, alias="usingIIT")
    branches_places: Optional[str] = Field(None, alias="branchesPlaces")
    building: Optional[str] = Field(None, alias="building")
    category: Optional[str] = Field(None) # Alias might be same as clientCategory?
    
    # Contact helper fields (often inside 'contact' string but sometimes separate)
    contact_name: Optional[str] = Field(None, alias="contactName")
    contact_number: Optional[str] = Field(None, alias="contactNumber")
    country_code: Optional[str] = Field(None, alias="countryCode")

    class Config:
        populate_by_name = True
        extra = "ignore" 
