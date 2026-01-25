import asyncio
import sys
import os

# Add app directory to path
sys.path.append(os.path.join(os.getcwd()))

from app.database import db_manager

async def verify_indexes():
    print("Verifying indexes...")
    await db_manager.connect()
    
    # Run the creation logic (simulating startup)
    from app.models.employee import Employee
    from app.models.client import ClientInDB
    await db_manager.ensure_indexes([Employee, ClientInDB])
    
    # Check indexes
    indexes = await db_manager.db.employees.index_information()
    print("Existing Indexes:", indexes)
    
    if "empID_1" in indexes:
        print("✓ Unique index on empID found.")
    else:
        print("✗ Index on empID NOT found.")
        
    await db_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(verify_indexes())
