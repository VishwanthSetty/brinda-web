"""
Authentication Service
Business logic for user authentication
"""

from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UserInDB
from app.schemas.user import User, UserCreate, Token
from app.utils.security import hash_password, verify_password, create_access_token


class AuthService:
    """
    Authentication service handling user registration and login.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["users"]
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """
        Find a user by email address.
        
        Args:
            email: User's email address
            
        Returns:
            UserInDB if found, None otherwise
        """
        user_doc = await self.collection.find_one({"email": email.lower()})
        
        if user_doc:
            user_doc["_id"] = str(user_doc["_id"])
            return UserInDB(**user_doc)
        
        return None
    
    async def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            user_data: User creation data
            
        Returns:
            Created user
            
        Raises:
            ValueError: If email already exists
        """
        # Check if user already exists
        existing = await self.get_user_by_email(user_data.email)
        if existing:
            raise ValueError("Email already registered")
        
        now = datetime.now(timezone.utc)
        
        user_doc = {
            "email": user_data.email.lower(),
            "password_hash": hash_password(user_data.password),
            "full_name": user_data.full_name,
            "role": user_data.role.value,
            "is_active": user_data.is_active,
            "created_at": now,
            "updated_at": now,
        }
        
        result = await self.collection.insert_one(user_doc)
        
        return User(
            id=str(result.inserted_id),
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_data.role,
            is_active=user_doc["is_active"],
            created_at=user_doc["created_at"],
            updated_at=user_doc["updated_at"],
        )
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Token]:
        """
        Authenticate a user and return a JWT token.
        
        Args:
            email: User's email address
            password: Plain text password
            
        Returns:
            Token if authentication successful, None otherwise
        """
        user = await self.get_user_by_email(email)
        
        if not user:
            return None
        
        if not user.is_active:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # Create access token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            empId=user.empId,
            employeeId=user.employeeId,
        )
        
        return Token(access_token=access_token)
