"""
Pydantic Models Package
Data models for the application
"""

# User models
from app.models.user import UserInDB
from app.schemas.user import User, UserCreate, UserRole, Token, TokenData

# Product models
from app.models.product import ProductInDB
from app.schemas.product import Product, ProductCreate, ProductUpdate

# Sale models
from app.models.sale import SaleInDB
from app.schemas.sale import Sale, SaleCreate, SalesSummary

# Client models
from app.models.client import ClientInDB
from app.schemas.client import (
    Client, ClientBase, ClientCreate, ClientUpdate,
    ClientMigrationItem, ClientMigrationRequest, ClientMigrationResponse
)

# Employee models
from app.models.employee import Employee

__all__ = [
    # User models
    "User",
    "UserCreate", 
    "UserInDB",
    "UserRole",
    "Token",
    "TokenData",
    # Product models
    "Product",
    "ProductCreate",
    "ProductUpdate",
    "ProductInDB",
    # Sale models
    "Sale",
    "SaleCreate",
    "SalesSummary",
    "SaleInDB",
    # Client models
    "Client",
    "ClientBase",
    "ClientCreate",
    "ClientUpdate",
    "ClientInDB",
    "ClientMigrationItem",
    "ClientMigrationRequest",
    "ClientMigrationResponse",
    # Employee models
    "Employee",
]
