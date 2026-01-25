"""
Authentication Routes
Handles user login and registration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.user import Token, UserCreate, User, LoginRequest
from app.services.auth import AuthService

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Authenticate user and return JWT token.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns a JWT token that should be included in the Authorization header
    for protected endpoints.
    """
    auth_service = AuthService(db)
    token = await auth_service.authenticate_user(
        email=login_data.email,
        password=login_data.password,
    )
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Register a new user.
    
    - **email**: User's email address (must be unique)
    - **password**: User's password (min 8 characters)
    - **full_name**: User's full name
    - **role**: User role (admin, manager, sales_rep)
    
    Note: In production, this endpoint should be protected or disabled.
    """
    auth_service = AuthService(db)
    
    try:
        user = await auth_service.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/logout")
async def logout():
    """
    Logout current user.
    
    Note: With JWT, logout is typically handled client-side by removing
    the token. This endpoint is provided for API completeness.
    """
    return {"message": "Successfully logged out"}
