"""
Routes Package
API route handlers
"""

from app.routes import auth, products, dashboard, clients, employees, tasks, analytics, eod_summary, attendance, sync

__all__ = ["auth", "products", "dashboard", "clients", "employees", "tasks", "analytics", "eod_summary", "attendance", "sync"]
