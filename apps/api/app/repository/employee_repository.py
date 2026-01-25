"""
Employee Repository
"""
from typing import Optional, List, Any
from app.database import db_manager
from app.models.employee import Employee

class EmployeeRepository:
    def __init__(self):
        self.collection_name = "employees"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def count(self) -> int:
        """Count all employees."""
        return await self.collection.count_documents({})

    async def upsert(self, employee: Employee) -> Any:
        """Upsert an employee based on empID."""
        employee_dict = employee.model_dump(by_alias=True, exclude_none=True)
        return await self.collection.update_one(
            {"empID": employee.empID},
            {"$set": employee_dict},
            upsert=True
        )

    async def find_by_name(self, emp_name: str) -> Optional[Employee]:
        """Find an employee by name (case-insensitive partial match)."""
        if not emp_name:
            return None
        doc = await self.collection.find_one({"empName": {"$regex": emp_name, "$options": "i"}})
        if doc:
            return Employee(**doc)
        return None

    async def get_employee_id_by_name(self, emp_name: str) -> Optional[str]:
        """Get employee ID from employee name. Returns None if not found."""
        employee = await self.find_by_name(emp_name)
        return employee.empID if employee else None

# Global instance (or can be used via dependency injection)
employee_repository = EmployeeRepository()
