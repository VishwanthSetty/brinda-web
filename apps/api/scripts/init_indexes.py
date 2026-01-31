"""
Index Initialization Script
Run this script to create all necessary MongoDB indexes.
"""
import asyncio
from app.database import db_manager

async def create_indexes():
    """Create all indexes for optimal query performance."""
    
    print("Database Index Initialization Started...")

    # Tasks Collection
    tasks = db_manager.get_collection("tasks")
    await tasks.create_index([("taskID", 1)], unique=True)
    await tasks.create_index([("date", 1)])
    await tasks.create_index([("employeeID", 1)])
    await tasks.create_index([("internalEmpID", 1)])
    await tasks.create_index([("customEntity.customEntityName", 1)])
    await tasks.create_index([("checkinTime", 1)])
    await tasks.create_index([("checkinTime", 1), ("employeeID", 1)])
    await tasks.create_index([("checkinTime", 1), ("internalEmpID", 1)])
    await tasks.create_index([("clientID", 1)])
    print("✓ Tasks indexes created")
    
    # Clients Collection
    clients = db_manager.get_collection("clients")
    await clients.create_index([("ID", 1)])
    await clients.create_index([("Visible To (*)", 1)])
    await clients.create_index([("Employee ID", 1)])
    await clients.create_index([("Client Catagory (*)", 1)])
    await clients.create_index([("Division Name new (*)", 1)])
    await clients.create_index([("Visible To (*)", 1), ("Client Catagory (*)", 1)])
    await clients.create_index([("unolo_client_id", 1)])
    await clients.create_index([("Created At", 1)])
    await clients.create_index([("Last Modified At", 1)])
    print("✓ Clients indexes created")
    
    # Users Collection
    users = db_manager.get_collection("users")
    await users.create_index([("email", 1)], unique=True)
    await users.create_index([("empId", 1)])
    await users.create_index([("employeeId", 1)])
    print("✓ Users indexes created")
    
    # Employees Collection
    employees = db_manager.get_collection("employees")
    await employees.create_index([("empID", 1)], unique=True)
    await employees.create_index([("employeeID", 1)])
    await employees.create_index([("empName", 1)])
    print("✓ Employees indexes created")
    
    # Products Collection
    products = db_manager.get_collection("products")
    await products.create_index([("created_at", 1)])
    await products.create_index([("updated_at", 1)])
    print("✓ Products indexes created")
    
    # Sales Collection
    sales = db_manager.get_collection("sales")
    await sales.create_index([("created_at", 1)])
    print("✓ Sales indexes created")
    
    print("\n✅ All indexes created successfully!")

if __name__ == "__main__":
    asyncio.run(create_indexes())
