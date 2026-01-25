"""
Analytics Schemas
"""

from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.schemas.client import Client

class ClientCategoryFilter(str, Enum):
    SCHOOL = "School"
    DISTRIBUTOR = "Distributor"

class SchoolCategory(str, Enum):
    HOT = "Hot"
    COLD = "Cold"
    WARM = "Warm"
    NO_INFO = "NoInfo"

class TaskClientCategoryFilter(str, Enum):
    SCHOOLS = "School"
    DISTRIBUTOR = "Distributor"
    BOTH = "Both"

class GroupByField(str, Enum):
    AREA_WISE = "AREA_WISE"      # Maps to division_name_new
    MATERIAL = "MATERIAL"        # Maps to using_material

class ClientListResponse(BaseModel):
    data: List[Client]
    total: int

class GroupedClientsResponse(BaseModel):
    groups: Dict[str, List[Client]]  # group_key -> list of clients
    unassigned: List[Client]         # clients missing the field
    total: int

# --- Task Analytics Schemas ---

from app.schemas.task import Task

class TaskAnalyticsResponse(BaseModel):
    """Response for GET /analytics/tasks"""
    data: List[Task]
    total: int

class ClientWithTasks(BaseModel):
    """Client with associated tasks"""
    client: Client
    tasks: List[Task]
    task_count: int

class AreaStats(BaseModel):
    unique_clients: int
    total_clients_in_area: int
    clients_with_tasks: List[ClientWithTasks]

class AreaWiseTasksResponse(BaseModel):
    """Response for GET /analytics/tasks/area-wise"""
    areas: Dict[str, AreaStats]  # area_name -> stats
    total_unique_clients: int
    total_tasks: int

class ClientWithLatestTask(BaseModel):
    client: Client
    latest_task: Optional[Task] = None
    school_category: SchoolCategory

class CategorySummary(BaseModel):
    hot_count: int
    cold_count: int
    warm_count: int
    no_info_count: int
    total: int

class SchoolCategoryResponse(BaseModel):
    """Response for GET /analytics/tasks/school-category"""
    hot: List[ClientWithLatestTask]
    cold: List[ClientWithLatestTask]
    warm: List[ClientWithLatestTask]
    no_info: List[ClientWithLatestTask]
    summary: CategorySummary
