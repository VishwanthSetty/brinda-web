"""
Authentication Middleware
JWT token validation and role-based access control
"""

from typing import Callable, List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.user import TokenData, UserRole
from app.utils.security import decode_access_token

# Security scheme for JWT Bearer tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        TokenData containing user information
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = decode_access_token(credentials.credentials)
    
    if token_data is None:
        raise credentials_exception
    
    return token_data


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """
    Dependency factory for role-based access control.
    
    Args:
        allowed_roles: List of roles that are allowed to access the endpoint
        
    Returns:
        Dependency function that validates user role
        
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user: TokenData = Depends(require_roles([UserRole.ADMIN]))
        ):
            ...
    """
    async def role_checker(
        current_user: TokenData = Depends(get_current_user),
    ) -> TokenData:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    
    return role_checker


# Convenience dependencies for common role combinations
async def get_admin_user(
    current_user: TokenData = Depends(require_roles([UserRole.ADMIN])),
) -> TokenData:
    """Dependency that requires ADMIN role."""
    return current_user


async def get_manager_or_admin(
    current_user: TokenData = Depends(
        require_roles([UserRole.ADMIN, UserRole.MANAGER])
    ),
) -> TokenData:
    """Dependency that requires ADMIN or MANAGER role."""
    return current_user


async def get_any_authenticated_user(
    current_user: TokenData = Depends(
        require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_REP])
    ),
) -> TokenData:
    """Dependency that requires any authenticated user."""
    return current_user
