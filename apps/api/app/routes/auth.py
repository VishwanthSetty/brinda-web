"""
Authentication Routes
Handles user login and registration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.database import get_database
from app.schemas.user import Token, UserCreate, User, LoginRequest, ChangePasswordRequest, AdminUserUpdate, UserRole
from app.services.auth import AuthService
from app.middleware.auth import get_any_authenticated_user, get_manager_or_admin
from app.utils.security import verify_password

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


@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user = Depends(get_any_authenticated_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Change password for the logged-in user.
    Requires old password for verification.
    """
    auth_service = AuthService(db)
    
    # Verify old password
    # We need to fetch the full user record including password_hash, 
    # as current_user might be a lightweight object or TokenData depending on implementation.
    # The middleware 'get_any_authenticated_user' usually returns TokenData or User model.
    # If it returns TokenData, it doesn't have password_hash.
    
    # Fetch full user to get hash
    # Assuming current_user has 'email' or 'id'
    
    # get_any_authenticated_user usually returns a User object (from DB) or TokenData.
    # Let's verify what it returns by checking middleware/auth.py, but safe bet is fetching by ID.
    
    user_id = getattr(current_user, "id", None) or getattr(current_user, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user")

    user_db = await auth_service.get_user_by_id(user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(password_data.old_password, user_db.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    success = await auth_service.update_user_credentials(user_id=user_id, password=password_data.new_password)
    
    if not success:
         raise HTTPException(status_code=500, detail="Failed to update password")
         
    return {"message": "Password updated successfully"}


@router.post("/update-user")
async def admin_update_user(
    update_data: AdminUserUpdate,
    current_user = Depends(get_manager_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Admin/Manager route to update user credentials (email, password).
    
    - **Admin**: Can update any user.
    - **Manager**: Can update Sales Reps (Employees) and other Managers (Non-Admins).
    """
    auth_service = AuthService(db)
    
    # Fetch target user to check permissions
    target_user = None
    if update_data.user_id:
        target_user = await auth_service.get_user_by_id(update_data.user_id)
    elif update_data.emp_id:
        target_user = await auth_service.get_user_by_emp_id(update_data.emp_id)
        
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

        
    # Permission Check
    # current_user.role is likely an Enum or str
    current_role = getattr(current_user, "role", "")
    target_role = target_user.role
    
    if current_role == UserRole.MANAGER:
        # Manager cannot edit Admin
        if target_role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Managers cannot modify Admin accounts"
            )
        # Manager can edit Sales Reps and Managers
        
    # Attempt Update
    try:
        await auth_service.update_user_credentials(
            user_id=target_user.id,
            email=update_data.email,
            password=update_data.password,
            role=update_data.role.value if update_data.role else None
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "User credentials updated successfully"}
