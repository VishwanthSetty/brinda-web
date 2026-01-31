"""
FastAPI Application Entry Point
Main application setup with routes, middleware, and lifecycle events
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import db_manager
from app.routes import auth, products, dashboard, clients, employees, tasks, analytics, webhooks, contact

from app.models.employee import Employee
from app.models.client import ClientInDB
from app.models.task import TaskInDB

# ...

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    """
    # Startup
    await db_manager.connect()
    # Auto-create indexes based on model definitions
    await db_manager.ensure_indexes([Employee, ClientInDB, TaskInDB])
    yield
    # Shutdown
    await db_manager.disconnect()


def create_app() -> FastAPI:
    """
    Application factory.
    
    Creates and configures the FastAPI application with:
    - CORS middleware
    - Route registration
    - Lifespan events
    """
    settings = get_settings()
    
    app = FastAPI(
        title="Brinda Publications API",
        description="Backend API for the Book Publications Web Portal",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",      # Always enable Swagger UI
        redoc_url="/redoc",    # Always enable ReDoc
        openapi_url="/openapi.json",  # Always enable OpenAPI schema
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins if settings.is_development else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # API Logging Middleware
    from app.middleware.logging import APILoggingMiddleware
    app.add_middleware(APILoggingMiddleware)

    
    # Health Check Endpoint
    @app.get("/api/health", tags=["Health"])
    async def health_check():
        """
        Health check endpoint.
        
        Returns the current status of the API and its dependencies.
        """
        return {
            "status": "healthy",
            "environment": settings.environment,
            "version": "1.0.0",
        }
    
    # Register Routes
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(products.router, prefix="/api/products", tags=["Products"])
    app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
    app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
    app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
    app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
    app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
    
    return app


# Create application instance
app = create_app()
