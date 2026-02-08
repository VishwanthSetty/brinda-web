
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Connection string
MONGO_URL = "mongodb://admin:password@localhost:27017"
DB_NAME = "brinda_web"

async def debug_eod_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db["eod_summaries"]

    # Target employee and date range provided by user
    employee_id_str = "185048"
    employee_id_int = 185048
    start_date = "2026-02-01"
    end_date = "2026-02-28"

    print(f"--- Debugging EOD Summaries for {employee_id_str} ({start_date} to {end_date}) ---")

    # 1. Total count check
    query = {
        "employeeID": {"$in": [employee_id_str, employee_id_int]},
        "date": {"$gte": start_date, "$lte": end_date}
    }
    count = await collection.count_documents(query)
    print(f"Total documents found: {count}")

    if count == 0:
        print("No documents found! Checking broader range...")
        # Check if *any* data exists for this employee
        any_count = await collection.count_documents({"employeeID": {"$in": [employee_id_str, employee_id_int]}})
        print(f"Any documents for this employee (all time): {any_count}")
        return

    # 2. Inspect first few documents
    cursor = collection.find(query).limit(5)
    print("\n--- Document Inspection ---")
    async for doc in cursor:
        print(f"Date: {doc.get('date')} (type: {type(doc.get('date'))})")
        print(f"Result Code: {doc.get('attendanceResultCode')} (type: {type(doc.get('attendanceResultCode'))})")
        print(f"Tasks: Admin={doc.get('adminCompletedTasks')}, Self={doc.get('selfCompletedTasks')}")
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(debug_eod_data())
