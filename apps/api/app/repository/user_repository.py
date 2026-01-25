"""
User Repository
"""
from typing import Optional
from app.database import db_manager
from app.models.user import UserInDB
from app.schemas.user import UserCreate

class UserRepository:
    def __init__(self):
        self.collection_name = "users"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def get_by_email(self, email: str) -> Optional[UserInDB]:
        """
        Find a user by email address.
        """
        user_doc = await self.collection.find_one({"email": email.lower()})
        
        if user_doc:
            user_doc["_id"] = str(user_doc["_id"])
            return UserInDB(**user_doc)
        
        return None

    async def create(self, user_doc: dict) -> UserInDB:
        """
        Insert a new user document.
        """
        result = await self.collection.insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        return UserInDB(**user_doc)

# Global instance
user_repository = UserRepository()
