import asyncio
from datetime import date
from typing import List, Optional
from unittest.mock import MagicMock, AsyncMock, patch
import sys
import os

# Ensure the app can be imported
sys.path.append(os.path.abspath("apps/api"))

# Creating mocks for the dependencies
mock_repo_module = MagicMock()
mock_emp_service_module = MagicMock()
mock_motor = MagicMock()

# Patching specifically the modules that might cause import errors if DB is not connected
with patch.dict(sys.modules, {
    'motor': mock_motor,
    'motor.motor_asyncio': mock_motor,
    'app.repository.emp_analytics_repository': mock_repo_module,
    'app.services.employee': mock_emp_service_module,
    'app.database': MagicMock(), 
}):
    # Pre-configure the mock repository instance
    mock_repo_instance = AsyncMock()
    mock_repo_module.emp_analytics_repository = mock_repo_instance
    
    try:
        from app.services.emp_analytics import get_employee_analytics
    except ImportError as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

    async def test_analytics_logic():
        print("Starting Verification Test...")
        
        # Mock Data
        class MockEod:
            def __init__(self, date_str, presence, tasks, distance, breaks, break_time):
                self.date = date_str
                self.attendance_result_code = 0 if presence == 'Present' else 1
                self.admin_completed_tasks = tasks
                self.self_completed_tasks = 0
                self.distance = distance
                self.num_breaks = breaks
                self.total_break_time = break_time

        # Scenario: 3 days. 
        # Day 1: Present, 5 tasks, 10km, 1 break (30min)
        # Day 2: Absent, 0 tasks, 0km
        # Day 3: Present, 3 tasks, 5km, 2 breaks (60min)
        
        mock_data = [
            MockEod("2026-01-01", 'Present', 5, 10.0, 1, "00:30:00"),
            MockEod("2026-01-02", 'Absent', 0, 0.0, 0, "00:00:00"),
            MockEod("2026-01-03", 'Present', 3, 5.0, 2, "01:00:00"),
        ]
        
        start_date = date(2026, 1, 1)
        end_date = date(2026, 1, 3) 

        # Setup expected calls
        mock_repo_instance.get_employee_eod_data.return_value = mock_data
        mock_emp_service_module.get_all_employees = AsyncMock(return_value=[{'empID': 'E001', 'empName': 'Test Emp'}])

        print("Running logic...")
        result = await get_employee_analytics('E001', start_date, end_date)
        
        print(f"\n--- Results ---")
        print(f"Employee: {result.employee_name}")
        print(f"Total Present: {result.total_present_days} (Expected: 2)")
        print(f"Avg Tasks: {result.avg_tasks_per_day} (Expected: 4.0)")
        print(f"Total Distance: {result.total_distance_km} (Expected: 15.0)")
        print(f"Avg Break Time: {result.avg_break_time_minutes} (Expected: 45.0)")
        print(f"Working Days: {result.total_working_days} (Expected: 3)")
        
        # Validation assertions
        assert result.total_present_days == 2, f"Got {result.total_present_days}"
        assert result.avg_tasks_per_day == 4.0, f"Got {result.avg_tasks_per_day}"
        assert result.total_distance_km == 15.0, f"Got {result.total_distance_km}"
        assert result.total_break_time_minutes == 90, f"Got {result.total_break_time_minutes}"
        assert result.avg_break_time_minutes == 45.0, f"Got {result.avg_break_time_minutes}"
        
        print("\n✅ Verification Successful!")

    if __name__ == "__main__":
        asyncio.run(test_analytics_logic())
