import asyncio
import os
import sys
from datetime import datetime, date

# Ensure the current directory is in the path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load .env from apps/api
dotenv_path = os.path.join(os.getcwd(), "apps", "api", ".env")
if os.path.exists(dotenv_path):
    print(f"Loading .env from {dotenv_path}")
    from dotenv import load_dotenv
    load_dotenv(dotenv_path)

from app.database import db_manager
from app.config import get_settings

async def migrate():
    print("Initializing database connection...")
    
    # Manually handle auth
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    user = os.getenv("MONGODB_USER")
    pwd = os.getenv("MONGODB_PASSWORD")
    
    if user and pwd and "@" not in mongodb_url:
        prefix = "mongodb://"
        if mongodb_url.startswith(prefix):
            rest = mongodb_url[len(prefix):]
            mongodb_url = f"mongodb://{user}:{pwd}@{rest}"
            print(f"DEBUG: Authenticating as {user}")

    # Monkey patch settings for this script execution
    get_settings().mongodb_url = mongodb_url
    
    await db_manager.connect()
    try:
        db = db_manager.db
        collection = db.tasks
        
        print("Starting migration of task dates...")
        count = 0
        updated = 0
        skipped = 0
        
        cursor = collection.find({})
        async for task in cursor:
            count += 1
            updates = {}
            task_id = task.get('taskID', 'unknown')
            
            # Check checkinTime
            if 'checkinTime' in task:
                val = task['checkinTime']
                if isinstance(val, str) and val:
                    try:
                        updates['checkinTime'] = datetime.fromisoformat(val.replace('Z', '+00:00'))
                    except ValueError:
                        print(f"Warning: Could not parse checkinTime for task {task_id}: {val}")
            
            # Check checkoutTime
            if 'checkoutTime' in task:
                val = task['checkoutTime']
                if isinstance(val, str) and val:
                    try:
                        updates['checkoutTime'] = datetime.fromisoformat(val.replace('Z', '+00:00'))
                    except ValueError:
                        print(f"Warning: Could not parse checkoutTime for task {task_id}: {val}")
                        
            # Check date field
            if 'date' in task:
                val = task['date']
                if isinstance(val, str) and val:
                    try:
                        # Try full datetime first
                        if 'T' in val:
                             updates['date'] = datetime.fromisoformat(val.replace('Z', '+00:00'))
                        else:
                             # Fallback to date only YYYY-MM-DD
                             updates['date'] = datetime.strptime(val, "%Y-%m-%d")
                    except ValueError:
                        print(f"Warning: Could not parse date for task {task_id}: {val}")
                elif isinstance(val, date) and not isinstance(val, datetime):
                     # Convert pure date to datetime at midnight
                     updates['date'] = datetime(val.year, val.month, val.day)

            if updates:
                await collection.update_one({'_id': task['_id']}, {'$set': updates})
                updated += 1
                if updated % 100 == 0:
                    print(f"Updated {updated} tasks...")
            else:
                skipped += 1
                    
        print(f"\nMigration complete!")
        print(f"Total tasks scanned: {count}")
        print(f"Tasks updated: {updated}")
        print(f"Tasks skipped (already correct): {skipped}")
        
    except Exception as e:
        print(f"An error occurred during migration: {e}")
    finally:
        await db_manager.disconnect()

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(migrate())
