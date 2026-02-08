"""
Unolo External API Client

Provides async HTTP client for interacting with Unolo's external API.
"""

import logging
from typing import Optional, Any, Dict, List

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class UnoloClientError(Exception):
    """Custom exception for Unolo API errors."""
    
    def __init__(self, message: str, status_code: Optional[int] = None, response: Optional[str] = None):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(self.message)


class UnoloClient:
    """
    Async HTTP client for Unolo External API.
    
    Authentication is done via `id` and `token` headers.
    """
    
    def __init__(self, base_url: Optional[str] = None, id: Optional[str] = None, token: Optional[str] = None):
        """
        Initialize the Unolo client.
        
        Args:
            base_url: Override base URL (defaults to settings)
            id: Override ID (defaults to settings)
            token: Override token (defaults to settings)
        """
        settings = get_settings()
        
        self.base_url = base_url or settings.unolo_base_url
        self.id = id or settings.unolo_id
        self.token = token or settings.unolo_token
        
        if not self.id or not self.token:
            raise UnoloClientError(
                "Unolo API credentials not configured. "
                "Please set ID and TOKEN in environment variables."
            )
        
        self._client: Optional[httpx.AsyncClient] = None
    
    @property
    def headers(self) -> Dict[str, str]:
        """Get authentication headers for API requests."""
        return {
            "id": str(self.id),
            "token": self.token,
            "Content-Type": "application/json",
        }
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create the HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=self.headers,
                timeout=30.0,
            )
        return self._client
    
    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Make an HTTP request to the Unolo API.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            params: Query parameters
            json: JSON body for POST/PUT requests
            
        Returns:
            Parsed JSON response
            
        Raises:
            UnoloClientError: If the request fails
        """
        client = await self._get_client()
        
        try:
            logger.info(f"Unolo API Request: {method} {endpoint}")
            
            response = await client.request(
                method=method,
                url=endpoint,
                params=params,
                json=json,
            )
            
            # Log response status
            logger.info(f"Unolo API Response: {response.status_code}")
            
            # Check for errors
            if response.status_code >= 400:
                error_text = response.text
                logger.error(f"Unolo API Error: {response.status_code} - {error_text}")
                raise UnoloClientError(
                    f"Unolo API request failed: {response.status_code}",
                    status_code=response.status_code,
                    response=error_text,
                )
            
            return response.json()
            
        except httpx.RequestError as e:
            logger.error(f"Unolo API Connection Error: {e}")
            raise UnoloClientError(f"Failed to connect to Unolo API: {e}")
    
    # ==================== Employee Master Endpoints ====================
    
    async def get_all_employees(self) -> List[Dict[str, Any]]:
        """
        Get all employees from the Unolo Employee Master API.
        
        Returns:
            List of employee dictionaries
            
        Raises:
            UnoloClientError: If the request fails
        """
        response = await self._request("GET", "/api/protected/employeeMaster")
        
        # The API might return data in various formats
        # Handle both direct list and wrapped response
        if isinstance(response, list):
            return response
        elif isinstance(response, dict):
            # Common patterns: {"data": [...]} or {"employees": [...]} or {"result": [...]}
            return response.get("data") or response.get("employees") or response.get("result") or []
        
        return []

        return []

    # ==================== Client Endpoints ====================

    async def get_all_clients(self) -> List[Dict[str, Any]]:
        """
        Get all clients from the Unolo API (v2).
        
        Returns:
            List of client dictionaries
        """
        response = await self._request("GET", "/api/protected/v2/clients")
        
        if isinstance(response, list):
            return response
        elif isinstance(response, dict):
            return response.get("data") or response.get("clients") or response.get("result") or []
        
        return []

    # ==================== Task Endpoints ====================
    
    async def get_tasks_detail(
        self, 
        start: str, 
        end: str, 
        custom_task_name: str
    ) -> List[Dict[str, Any]]:
        """
        Get tasks details from Unolo API.
        
        Args:
            start: Start date (YYYY-MM-DD)
            end: End date (YYYY-MM-DD)
            custom_task_name: Name of the task to filter
            
        Returns:
            List of task dictionaries
        """
        params = {
            "start": start,
            "end": end,
            "customTaskName": custom_task_name
        }
        
        response = await self._request("GET", "/api/protected/tasksDetail/v2", params=params)
        
        # Handle various response formats similar to employees
        if isinstance(response, list):
            return response
        elif isinstance(response, dict):
            return response.get("data") or response.get("tasks") or response.get("result") or []
        
        return []

    # ==================== EOD Summary Endpoints ====================

    async def get_eod_summary(
        self, 
        start: str, 
        end: str
    ) -> List[Dict[str, Any]]:
        """
        Get EOD summary from Unolo API.
        
        Args:
            start: Start date (YYYY-MM-DD)
            end: End date (YYYY-MM-DD)
            
        Returns:
            List of EOD summary dictionaries
        """
        params = {
            "start": start,
            "end": end
        }
        
        response = await self._request("GET", "/api/protected/eodSummary", params=params)
        
        if isinstance(response, list):
            return response
        elif isinstance(response, dict):
            return response.get("data") or response.get("summary") or response.get("result") or []
        
        return []

    # ==================== Attendance Endpoints ====================

    async def get_attendance(
        self,
        start: str,
        end: str
    ) -> Dict[str, Any]:
        """
        Get attendance data from Unolo API.
        
        Args:
            start: Start date (YYYY-MM-DD)
            end: End date (YYYY-MM-DD)
            
        Returns:
            Dictionary with attendance details
        """
        params = {
            "start": start,
            "end": end
        }
        
        response = await self._request("GET", "/api/protected/getAttendance", params=params)

        # Response seems to be a single object based on the user request example.
        # But commonly Unolo returns wrapped responses.
        # The user example shows a direct object, but often it might be in a list if range > 1 day?
        # The user provided example shows a single object for "totalDays": 2, "date": "2026-01-22".
        # This implies it might return a list if multiple employees or just one object if filtered?
        # Actually, looking at the user payload, it looks like a single object describing one employee's stats.
        # However, the user request says ?start=...&end=...
        # Let's assume it returns whatever the API returns, usually a dict or list.
        # For safety, I'll return Any (typed as Dict[str, Any] in signature but might be List).
        # Wait, if I look at the previous methods, I am extracting data/result.
        # The user provided JSON is a bare object.
        # Let's just return the response directly if it looks like the target object, or extract if wrapped.
        
        if isinstance(response, dict):
             # Check if it's wrapped
            if "data" in response or "result" in response:
                 return response.get("data") or response.get("result")
            return response
            
        return response


# Factory function for dependency injection
async def get_unolo_client() -> UnoloClient:
    """
    FastAPI dependency to get Unolo client.
    
    Usage:
        @router.get("/employees")
        async def get_employees(client: UnoloClient = Depends(get_unolo_client)):
            return await client.get_all_employees()
    """
    return UnoloClient()
