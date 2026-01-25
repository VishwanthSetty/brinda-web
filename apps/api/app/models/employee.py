"""
Employee Database Models
"""

from app.schemas.employee import EmployeeBase

class Employee(EmployeeBase):
    """
    Employee model representing the data structure from Unolo API.
    Stored in database.
    """
    class Config:
        populate_by_name = True
    
    class MongoMeta:
        collection_name = "employees"
        indexes = [
            {"keys": [("empID", 1)], "unique": True},
            {"keys": [("employeeID", 1)]},
            {"keys": [("empName", 1)]}
        ]
