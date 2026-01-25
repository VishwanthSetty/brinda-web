"""
Employee Schemas
"""

from typing import Optional
from pydantic import BaseModel, Field

class EmployeeBase(BaseModel):
    """
    Employee base model representing the data structure from Unolo API.
    """
    empName: str = Field(..., max_length=90, description="Full employee name")
    firstName: Optional[str] = Field(None, max_length=45)
    lastName: Optional[str] = Field(None, max_length=45)
    empID: str = Field(..., max_length=8, description="Unique userID for field executive")
    employeeID: Optional[int] = Field(None, description="Numeric employee ID")
    empEmail: Optional[str] = Field(None, max_length=45)
    empPhoneNumber: Optional[str] = Field(None, max_length=45)
    managerName: Optional[str] = Field(None)
    managerEmail: Optional[str] = Field(None)
    managerPhoneNumber: Optional[str] = Field(None, max_length=45)
    profileID: Optional[int] = Field(None, description="Team ID")
    designationID: Optional[int] = Field(None, description="Designation ID")
    city: Optional[str] = Field(None, max_length=45)

    class Config:
        populate_by_name = True

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    empName: Optional[str] = Field(None, max_length=90)
    firstName: Optional[str] = Field(None, max_length=45)
    lastName: Optional[str] = Field(None, max_length=45)
    empID: Optional[str] = Field(None, max_length=8)
    employeeID: Optional[int] = Field(None)
    empEmail: Optional[str] = Field(None, max_length=45)
    empPhoneNumber: Optional[str] = Field(None, max_length=45)
    managerName: Optional[str] = Field(None)
    managerEmail: Optional[str] = Field(None)
    managerPhoneNumber: Optional[str] = Field(None, max_length=45)
    profileID: Optional[int] = Field(None)
    designationID: Optional[int] = Field(None)
    city: Optional[str] = Field(None, max_length=45)

    class Config:
        populate_by_name = True
