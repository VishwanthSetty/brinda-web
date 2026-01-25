"""
Security Utilities
Password hashing and JWT token management
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.config import get_settings
from app.schemas.user import TokenData, UserRole


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    # Encode password and truncate to 72 bytes (bcrypt limit)
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    # Truncate to 72 bytes to match how password was hashed
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(
    user_id: str,
    email: str,
    role: UserRole,
    full_name: str,
    empId: Optional[str] = None,
    employeeId: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User's unique identifier
        email: User's email address
        role: User's role
        full_name: User's full name
        empId: Employee ID (optional, legacy)
        employeeId: Employee ID (optional)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    settings = get_settings()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_expire_minutes
        )
    
    to_encode = {
        "sub": user_id,
        "email": email,
        "full_name": full_name,
        "role": role.value,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    if empId:
        to_encode["empId"] = empId
    if employeeId:
        to_encode["employeeId"] = employeeId
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData if valid, None if invalid or expired
    """
    settings = get_settings()
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        full_name: str = payload.get("full_name")
        role_str: str = payload.get("role")
        empId: str = payload.get("empId")
        employeeId: str = payload.get("employeeId")
        
        if user_id is None:
            return None
        
        role = UserRole(role_str) if role_str else None
        
        return TokenData(
            user_id=user_id,
            email=email,
            full_name=full_name,
            role=role,
            empId=empId,
            employeeId=employeeId
        )
        
    except JWTError:
        return None
