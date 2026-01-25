"""
MongoDB Database Connection
Async MongoDB connection using Motor driver
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from app.config import get_settings


class DatabaseManager:
    """
    Manages MongoDB connection lifecycle.
    
    Usage:
        db_manager = DatabaseManager()
        await db_manager.connect()
        # ... use db_manager.db for database operations
        await db_manager.disconnect()
    """
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self) -> None:
        """
        Establish connection to MongoDB.
        
        Uses settings from environment variables.
        """
        settings = get_settings()
        
        self.client = AsyncIOMotorClient(
            settings.mongodb_url,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000
        )
        self.db = self.client[settings.database_name]
        
        # Verify connection
        await self.client.admin.command("ping")
        # Mask password for logging
        print(f"✓ Connected to MongoDB: {settings.database_name} at {settings.mongodb_url}")
    
    async def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")
    
    async def ensure_indexes(self, models: list) -> None:
        """
        Create database indexes for provided models.
        Models must have a `MongoMeta` inner class with `collection_name` and `indexes`.
        """
        if self.db is None:
            print("⚠ Database not connected, skipping index creation")
            return
            
        print("⟳ Verifying database indexes...")
        
        for model in models:
            if not hasattr(model, "MongoMeta"):
                continue
                
            meta = model.MongoMeta
            if not hasattr(meta, "collection_name") or not hasattr(meta, "indexes"):
                continue
                
            collection_name = meta.collection_name
            indexes = meta.indexes
            
            if not indexes:
                continue
                
            collection = self.db[collection_name]
            
            for index in indexes:
                keys = index.get("keys")
                if not keys:
                    continue
                    
                kwargs = {k: v for k, v in index.items() if k != "keys"}
                
                try:
                    await collection.create_index(keys, background=True, **kwargs)
                except Exception as e:
                    print(f"✗ Failed to create index {keys} on {collection_name}: {e}")
                    
        print("✓ Database indexes verified")

    def get_collection(self, name: str):
        """Get a collection from the database."""
        if self.db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.db[name]


# Global database manager instance
db_manager = DatabaseManager()


async def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency to get database instance.
    
    Usage in FastAPI routes:
        @router.get("/items")
        async def get_items(db: AsyncIOMotorDatabase = Depends(get_database)):
            ...
    """
    if db_manager.db is None:
        raise RuntimeError("Database not connected")
    return db_manager.db
