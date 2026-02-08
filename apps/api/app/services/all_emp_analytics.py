from datetime import date, timedelta
from typing import List
from app.repository.emp_analytics_repository import emp_analytics_repository
from app.schemas.all_emp_analytics import AllEmployeesOverviewResponse, EmployeeSummary
from app.services.employee import get_all_employees
from app.services.emp_analytics import get_working_days, parse_break_time

async def get_all_employees_overview(
    start_date: date,
    end_date: date
) -> AllEmployeesOverviewResponse:
    # 1. Fetch all employees
    all_employees = await get_all_employees()
    
    # 2. Get working days count
    working_days = get_working_days(start_date, end_date)
    total_working_days = len(working_days)
    
    summaries: List[EmployeeSummary] = []
    
    # Aggragates for the top-level stats
    grand_total_tasks = 0
    grand_total_distance = 0.0
    total_attendance_sum = 0.0
    
    # 3. Iterate employees and calculate stats
    # Optimization note: In a real-world high-scale app, we would do a single aggregated DB query.
    # For now, looping is acceptable given the definition of get_employee_eod_data.
    
    for emp in all_employees:
        emp_id = str(emp.get('employeeID', ''))
        # Fallback to empID if employeeID is missing
        if not emp_id:
            emp_id = emp.get('empID', '')
            
        emp_name = emp.get('empName', 'Unknown')
        role = emp.get('role', 'N/A')
        
        # Skip if no ID
        if not emp_id:
            continue
            
        # Fetch EOD data
        eod_data = await emp_analytics_repository.get_employee_eod_data(emp_id, start_date, end_date)
        
        total_present = 0
        emp_tasks = 0
        emp_distance = 0.0
        emp_total_breaks = 0
        emp_break_time = 0
        
        # We need to map data to check against working days properly, 
        # or just iterate eod_data if we trust it only contains relevant records.
        # However, to calculate attendance %, we need valid working days.
        
        # Quick map for O(1) lookup
        data_map = {item.date: item for item in eod_data}
        
        for day in working_days:
            day_str = day.strftime("%Y-%m-%d")
            record = data_map.get(day_str)
            
            if record:
                # Presence logic matches emp_analytics service
                if record.attendance_result_code in [0, 1, 6]:
                    total_present += 1
                    
                    # Add metrics
                    emp_tasks += (record.admin_completed_tasks or 0) + (record.self_completed_tasks or 0)
                    emp_distance += (record.distance or 0.0)
                    emp_total_breaks += (record.num_breaks or 0)
                    emp_break_time += parse_break_time(record.total_break_time)
        
        # Metrics Calculation
        att_pct = (total_present / total_working_days * 100) if total_working_days > 0 else 0.0
        avg_break = (emp_break_time / total_present) if total_present > 0 else 0.0
        
        summary = EmployeeSummary(
            employee_id=emp_id,
            employee_name=emp_name,
            role=role,
            attendance_percentage=round(att_pct, 1),
            total_tasks=emp_tasks,
            total_distance_km=round(emp_distance, 2),
            total_breaks=emp_total_breaks,
            avg_break_time_minutes=round(avg_break, 1),
            total_present_days=total_present
        )
        
        summaries.append(summary)
        
        # Grand totals
        grand_total_tasks += emp_tasks
        grand_total_distance += emp_distance
        total_attendance_sum += att_pct

    # 4. Final Aggregation
    emp_count = len(summaries)
    avg_attendance_overall = (total_attendance_sum / emp_count) if emp_count > 0 else 0.0
    
    return AllEmployeesOverviewResponse(
        total_employees=emp_count,
        avg_attendance=round(avg_attendance_overall, 1),
        total_tasks=grand_total_tasks,
        total_distance_km=round(grand_total_distance, 2),
        employees=summaries
    )
