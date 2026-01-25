
import asyncio
import sys
import os
import pprint
from datetime import datetime, date, timedelta

from dotenv import load_dotenv

# Add app directory to path
sys.path.append(os.path.join(os.getcwd(), "apps", "api"))

# Load .env from apps/api
dotenv_path = os.path.join(os.getcwd(), "apps", "api", ".env")
if os.path.exists(dotenv_path):
    print(f"Loading .env from {dotenv_path}")
    load_dotenv(dotenv_path)
else:
    print(f"Warning: .env not found at {dotenv_path}")

from app.database import db_manager
from app.repository.task_repository import task_repository
from app.repository.client_repository import client_repository
from app.services.analytics import GROUP_FIELD_MAPPING, GroupByField

async def main():
    print("Connecting to DB...")
    
    # Manually handle auth for script since database.py might be missing it
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    user = os.getenv("MONGODB_USER")
    pwd = os.getenv("MONGODB_PASSWORD")
    
    if user and pwd and "@" not in mongodb_url:
        # Inject credentials
        prefix = "mongodb://"
        if mongodb_url.startswith(prefix):
            rest = mongodb_url[len(prefix):]
            mongodb_url = f"mongodb://{user}:{pwd}@{rest}"
            print(f"DEBUG: Authenticating as {user}")
            
    # Monkey patch settings for this script execution
    from app.config import get_settings
    get_settings().mongodb_url = mongodb_url
    
    await db_manager.connect()
    
    print("--- Inspecting Task Dates ---")
    tasks_coll = db_manager.get_collection("tasks")
    
    # Get 1 sample task
    sample_task = await tasks_coll.find_one({})
    if not sample_task:
        print("No tasks found.")
        return
        
    d = sample_task.get("date")
    t_id = sample_task.get("taskID")
    emp_id = sample_task.get("employeeID") or sample_task.get("internalEmpID")
    
    print(f"Sample Task: {t_id}")
    print(f"Date details: Value={d}, Type={type(d)}")
    
    if isinstance(d, datetime):
        date_only = d.date()
        print(f"Using Date for Filter: {date_only}")
        
        # Test Exact Date with Timezone Handling check
        print(f"\nTest 1: Filter for Exact Date {date_only}")
        
        # Simulating what the repository does: naive datetime
        start_naive = datetime(date_only.year, date_only.month, date_only.day)
        end_naive = datetime(date_only.year, date_only.month, date_only.day, 23, 59, 59)
        print(f"Repository uses Naive Datetime: {start_naive} to {end_naive}")
        
        results = await task_repository.find_tasks_by_employee_with_client_filter(
            employee_id=emp_id,
            start_date=date_only,
            end_date=date_only
        )
        found = any(t.task_id == t_id for t in results)
        print(f"Result count: {len(results)}. Found sample task? {found}")
        
        if not found and isinstance(d, datetime):
            print("\n!!! DEBUGGING TIMEZONE ISSUE !!!")
            print(f"DB Date Value: {d!r} (tzinfo={d.tzinfo})")
            print(f"Filter Start: {start_naive!r} (tzinfo={start_naive.tzinfo})")
            
            # Try to fetch manually with naive dates to confirm failure
            direct_naive = await tasks_coll.find_one({
                "checkinTime": {"$gte": start_naive, "$lte": end_naive},
                "taskID": t_id
            })
            print(f"Direct Query with Naive: Found? {direct_naive is not None}")

            total_tasks_agg += 1
            if t.get("taskID") == t_id:
                task_found_in_agg = True
        
        print(f"Aggregation found {total_tasks_agg} tasks. Found sample task? {task_found_in_agg}")
        
    else:
        print("!! Task date is not a datetime object!")

    await db_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
