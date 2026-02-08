from typing import List
from pydantic import BaseModel

class EmployeeSummary(BaseModel):
    employee_id: str
    employee_name: str
    role: str
    attendance_percentage: float
    total_tasks: int
    total_distance_km: float
    total_breaks: int
    avg_break_time_minutes: float
    total_present_days: int

class AllEmployeesOverviewResponse(BaseModel):
    total_employees: int
    avg_attendance: float
    total_tasks: int
    total_distance_km: float
    employees: List[EmployeeSummary]
