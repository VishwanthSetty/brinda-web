from datetime import date, timedelta, datetime
from typing import List, Dict, Any, Optional
from app.repository.emp_analytics_repository import emp_analytics_repository
from app.schemas.emp_analytics import EmployeeAnalyticsResponse, DailyAnalytics
from app.services.employee import get_all_employees

def get_working_days(start_date: date, end_date: date) -> List[date]:
    """Generates a list of working days (Mon-Sat) between start and end date (inclusive)."""
    days = []
    current = start_date
    while current <= end_date:
        # 0=Monday, 6=Sunday. We exclude Sunday (6).
        if current.weekday() != 6:
            days.append(current)
        current += timedelta(days=1)
    return days

def parse_break_time(time_str: Optional[str]) -> int:
    """Parses 'HH:MM:SS' string to minutes. Returns 0 if invalid or None."""
    if not time_str:
        return 0
    try:
        parts = time_str.split(':')
        if len(parts) == 3:
            h, m, s = map(int, parts)
            return h * 60 + m + round(s / 60)
        return 0
    except ValueError:
        return 0

async def get_employee_analytics(
    employee_id: str,
    start_date: date,
    end_date: date
) -> EmployeeAnalyticsResponse:
    # 1. Fetch all employees to get name
    all_employees = await get_all_employees()
    employee_name = "Unknown"
    
    # Map empID (string) or employeeID (int) to name
    # We try both string and int matching for robustness
    for emp in all_employees:
        e_id_str = str(emp.get('employeeID', ''))
        internal_id = emp.get('empID', '')
        
        if e_id_str == str(employee_id) or internal_id == str(employee_id):
            employee_name = emp.get('empName', 'Unknown')
            # Ensure we use the numeric ID for repository query if that's what we found
            if e_id_str:
                employee_id = e_id_str
            break

    # 2. Fetch EOD Data
    eod_data = await emp_analytics_repository.get_employee_eod_data(employee_id, start_date, end_date)
    
    # Index data by date string for easy lookup
    data_map = {item.date: item for item in eod_data}
    
    # 3. Generate Date Range (Working Days Only)
    working_days = get_working_days(start_date, end_date)
    
    daily_analytics = []
    
    total_present = 0
    total_tasks = 0
    total_distance = 0.0
    total_breaks = 0
    total_break_time = 0
    
    for day in working_days:
        day_str = day.strftime("%Y-%m-%d")
        record = data_map.get(day_str)
        
        is_present = False
        tasks = 0
        distance = 0.0
        num_breaks = 0
        break_time = 0
        
        if record:
            # Presence check: 
            # 0, 1 = Present (various modes)
            # 6 = Often seen in data (User confirmed data exists with code 6) - treating as Present for now
            if record.attendance_result_code in [0, 1, 6]:
                is_present = True
                
                # Metrics only counted if present
                tasks = record.admin_completed_tasks + record.self_completed_tasks
                distance = record.distance or 0.0
                num_breaks = record.num_breaks or 0
                break_time = parse_break_time(record.total_break_time)

        daily_analytics.append(DailyAnalytics(
            date=day,
            is_present=is_present,
            tasks_done=tasks,
            distance_km=distance,
            num_breaks=num_breaks,
            break_time_minutes=break_time,
            is_working_day=True
        ))
        
        if is_present:
            total_present += 1
            total_tasks += tasks
            total_distance += distance
            total_breaks += num_breaks
            total_break_time += break_time

    # 4. Calculate Averages
    avg_tasks = total_tasks / total_present if total_present > 0 else 0
    avg_distance = total_distance / total_present if total_present > 0 else 0
    avg_breaks = total_breaks / total_present if total_present > 0 else 0
    avg_break_time = total_break_time / total_present if total_present > 0 else 0
    
    attendance_pct = (total_present / len(working_days)) * 100 if working_days else 0.0

    return EmployeeAnalyticsResponse(
        employee_id=str(employee_id),
        employee_name=employee_name,
        total_working_days=len(working_days),
        total_present_days=total_present,
        attendance_percentage=round(attendance_pct, 1),
        
        total_tasks=total_tasks,
        avg_tasks_per_day=round(avg_tasks, 1),
        
        total_distance_km=round(total_distance, 2),
        avg_distance_per_day=round(avg_distance, 2),
        
        total_breaks=total_breaks,
        avg_breaks_per_day=round(avg_breaks, 1),
        total_break_time_minutes=total_break_time,
        avg_break_time_minutes=round(avg_break_time, 1),
        
        daily_breakdown=daily_analytics
    )
