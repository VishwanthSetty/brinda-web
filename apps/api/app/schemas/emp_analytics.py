from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date

class DailyAnalytics(BaseModel):
    date: date
    is_present: bool
    tasks_done: int
    distance_km: float
    num_breaks: int
    break_time_minutes: int
    is_working_day: bool

class EmployeeAnalyticsResponse(BaseModel):
    employee_id: str
    employee_name: str
    
    # Presence Logic
    total_working_days: int
    total_present_days: int
    attendance_percentage: float
    
    # Tasks (Only on present days)
    total_tasks: int
    avg_tasks_per_day: float
    
    # Distance
    total_distance_km: float
    avg_distance_per_day: float
    
    # Breaks (Only on present days)
    total_breaks: int
    avg_breaks_per_day: float
    total_break_time_minutes: int
    avg_break_time_minutes: float
    
    # Daily Breakdown
    daily_breakdown: List[DailyAnalytics]
