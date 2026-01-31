"""
API Request/Response Logging Middleware
Logs all API calls with user info, request details, timing, and errors
"""

import time
import json
import logging
import os
from datetime import datetime, timezone
from logging.handlers import TimedRotatingFileHandler
from typing import Callable, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import status

# Configure logger
logger = logging.getLogger("api_logger")
logger.setLevel(logging.INFO)

# Create console handler if not exists
if not logger.handlers:
    # 1. Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 2. Daily Rotating File Handler
    try:
        # Create logs directory: apps/api/logs/
        # Current file: apps/api/app/middleware/logging.py
        log_dir = os.path.join(os.path.dirname(__file__), "..", "..", "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        log_file_path = os.path.join(log_dir, "api.log")
        
        file_handler = TimedRotatingFileHandler(
            filename=log_file_path,
            when="midnight",
            interval=1,
            backupCount=30,
            encoding="utf-8"
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        file_handler.suffix = "%Y-%m-%d" # Suffix for rotated files: api.log.2025-01-30
        
        logger.addHandler(file_handler)
    except Exception as e:
        print(f"Failed to setup file logging: {e}")


class APILoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all API requests and responses.
    
    Logs:
    - Timestamp
    - HTTP method and path
    - User info (from JWT if authenticated)
    - Request body (for POST/PUT/PATCH)
    - Response status code
    - Processing time
    - Errors if any
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Record start time
        start_time = time.time()
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Extract request info
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)
        client_ip = request.client.host if request.client else "unknown"
        
        # Try to get user info from request state (set by auth middleware)
        user_info = "anonymous"
        try:
            if hasattr(request.state, "user"):
                user = request.state.user
                if hasattr(user, "username"):
                    user_info = user.username
                elif hasattr(user, "email"):
                    user_info = user.email
                elif isinstance(user, dict):
                    user_info = user.get("username") or user.get("email") or user.get("sub") or "authenticated"
        except Exception:
            pass
        
        # Try to read request body for POST/PUT/PATCH
        request_body = None
        if method in ["POST", "PUT", "PATCH"]:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    try:
                        request_body = json.loads(body_bytes.decode("utf-8"))
                        # Mask sensitive fields
                        if isinstance(request_body, dict):
                            for key in ["password", "token", "secret", "api_key", "refresh_token"]:
                                if key in request_body:
                                    request_body[key] = "***MASKED***"
                    except json.JSONDecodeError:
                        request_body = "<non-json body>"
            except Exception:
                request_body = "<body read error>"

        # Process request
        error_detail = None
        response_status = None
        
        try:
            response = await call_next(request)
            response_status = response.status_code
        except Exception as e:
            error_detail = str(e)
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR
            raise
        finally:
            # Calculate processing time
            process_time = time.time() - start_time
            process_time_ms = round(process_time * 1000, 2)
            
            # Build log entry
            log_entry = {
                "timestamp": timestamp,
                "method": method,
                "path": path,
                "query_params": query_params if query_params else None,
                "user": user_info,
                "client_ip": client_ip,
                "status_code": response_status,
                "process_time_ms": process_time_ms,
            }
            
            # Add request body for non-GET requests (truncate if too large)
            if request_body:
                body_str = json.dumps(request_body)
                if len(body_str) > 1000:
                    log_entry["request_body"] = body_str[:1000] + "...<truncated>"
                else:
                    log_entry["request_body"] = request_body
            
            # Add error if present
            if error_detail:
                log_entry["error"] = error_detail
            
            # Determine log level based on status code
            if response_status and response_status >= 500:
                logger.error(json.dumps(log_entry))
            elif response_status and response_status >= 400:
                logger.warning(json.dumps(log_entry))
            else:
                logger.info(json.dumps(log_entry))
        
        return response
