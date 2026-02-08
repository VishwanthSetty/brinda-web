
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

# Connection string
# Constructed from .env values
MONGO_URL = "mongodb://admin:password@localhost:27017"
DB_NAME = "brinda_web"

async def debug_eod_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db["eod_summaries"]

    # Target employee and date range from screenshot
    employee_id_str = "186161"
    employee_id_int = 186161
    start_date = "2026-01-01"
    end_date = "2026-01-31"

    print(f"--- Debugging EOD Summaries for {employee_id_str} ({start_date} to {end_date}) ---")

    # 1. Check count with string ID
    count_str = await collection.count_documents({
        "employeeID": employee_id_str,
        "date": {"$gte": start_date, "$lte": end_date}
    })
    print(f"Count with string ID '{employee_id_str}': {count_str}")

    # 2. Check count with int ID
    count_int = await collection.count_documents({
        "employeeID": employee_id_int,
        "date": {"$gte": start_date, "$lte": end_date}
    })
    print(f"Count with int ID {employee_id_int}: {count_int}")

    # 3. Fetch one document to see structure
    sample_doc = await collection.find_one({"employeeID": {"$in": [employee_id_str, employee_id_int]}})
    if sample_doc:
        print("\n--- Sample Document Structure ---")
        # specific fields of interest
        print(f"ID: {sample_doc.get('_id')} (type: {type(sample_doc.get('_id'))})")
        print(f"employeeID type: {type(sample_doc.get('employeeID'))}")
        
        # Test Model Validation
        print("\n--- Testing Model Validation ---")
        try:
            from app.models.eod_summary import EodSummaryInDB
            # Mimic repository fix
            if "_id" in sample_doc:
                sample_doc["_id"] = str(sample_doc["_id"])
            model_instance = EodSummaryInDB(**sample_doc)
            print("Model validation SUCCESS!")
            print(f"Parsed ID: {model_instance.id}")
        except Exception as e:
            print(f"Model validation FAILED: {e}")
            
    else:
        print("\nNo documents found for this employee (any date).")

        # 4. Global sample to see what date format/ID types look like generally
        any_doc = await collection.find_one({})
        if any_doc:
            print("\n--- Random Global Sample ---")
            print(f"employeeID type: {type(any_doc.get('employeeID'))}")
            print(f"employeeID value: {any_doc.get('employeeID')}")
            print(f"date value: {any_doc.get('date')}")
        else:
            print("\nCollection appears empty.")

if __name__ == "__main__":
    asyncio.run(debug_eod_data())
