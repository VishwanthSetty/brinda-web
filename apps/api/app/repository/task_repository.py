"""
Task Repository
"""
from typing import List, Tuple, Any, Dict, Optional
from datetime import datetime, date, timezone

from app.database import db_manager
from app.models.task import TaskInDB
from app.schemas.task import TaskCreate

class TaskRepository:
    def __init__(self):
        self.collection_name = "tasks"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def upsert(self, task_data: TaskCreate) -> Any:
        """
        Upsert a task based on taskID.
        Updates existing record or inserts new one.
        """
        # Convert Pydantic model to dict, handling aliases
        task_dict = task_data.model_dump(by_alias=True, exclude_none=True)
        
        # Convert date objects to datetime for MongoDB compatibility
        if "date" in task_dict:
            d = task_dict["date"]
            if isinstance(d, datetime):
                # Already datetime, keep as-is but ensure time is at midnight for consistency
                task_dict["date"] = datetime(d.year, d.month, d.day)
            elif isinstance(d, date):
                # Convert date to datetime at midnight
                task_dict["date"] = datetime(d.year, d.month, d.day)
            elif isinstance(d, str):
                # Parse string date (YYYY-MM-DD format)
                parsed = datetime.strptime(d, "%Y-%m-%d")
                task_dict["date"] = parsed
                
        # Handle checkinTime and checkoutTime conversion
        for field in ["checkinTime", "checkoutTime"]:
            if field in task_dict and task_dict[field]:
                val = task_dict[field]
                if isinstance(val, str):
                    try:
                        # Try parsing ISO format
                        task_dict[field] = datetime.fromisoformat(val.replace('Z', '+00:00'))
                    except ValueError:
                        pass # Keep as string if parsing fails
        
        # Add local timestamps
        now = datetime.utcnow()
        task_dict["updated_at_local"] = now
        
        # Use $setOnInsert for created_at_local to only set it on insert
        update_op = {
            "$set": task_dict,
            "$setOnInsert": {"created_at_local": now}
        }
        
        # Remove created_at_local from $set if it exists in task_dict to avoid overwriting
        if "created_at_local" in update_op["$set"]:
            del update_op["$set"]["created_at_local"]

        return await self.collection.update_one(
            {"taskID": task_data.task_id},
            update_op,
            upsert=True
        )

    async def find_with_filters(
        self,  
        filters: Dict[str, Any], 
        limit: int, 
        skip: int
    ) -> Tuple[List[TaskInDB], int]:
        """
        Find tasks matching query with pagination.
        Returns: (List[TaskInDB], total_count)
        """
        # Get total count for pagination
        total_count = await self.collection.count_documents(filters)
        
        # Sort by date descending (newest first)
        cursor = self.collection.find(filters).sort("date", -1).skip(skip).limit(limit)
        
        tasks = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                tasks.append(TaskInDB(**doc))
            except Exception as e:
                # Log error but continue processing other records
                print(f"Error validating task data {doc.get('taskID')}: {e}")
                continue
            
        return tasks, total_count

    async def find_tasks_by_employee_with_client_filter(
        self,
        employee_id: str,
        start_date: date,
        end_date: date,
        client_category: Optional[str] = None
    ) -> List[TaskInDB]:
        """
        Find tasks for employee within date range, optionally filtered by client category.
        Performs a lookup on clients collection to filter by 'Client Catagory (*)'.
        """
        # 1. Match tasks by employee and date range using checkinTime
        # Convert to UTC-aware datetime
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        print(start_dt, end_dt)
        match_stage = {
            "checkinTime": {"$gte": start_dt, "$lte": end_dt},
            "$or": [
                {"employeeID": employee_id},
                {"internalEmpID": employee_id}
            ]
        }
        
        pipeline = [
            {"$match": match_stage},
            {"$sort": {"checkinTime": -1}}
        ]
        
        # 2. Always lookup client details to populate response
        pipeline.extend([
            # Join with clients
            {
                "$lookup": {
                    "from": "clients",
                    "let": {"cid": "$clientID"},
                    "pipeline": [
                        {"$match": {
                            "$expr": {
                                "$or": [
                                    {"$eq": ["$unolo_client_id", "$$cid"]},
                                    {"$eq": [{"$toString": "$unolo_client_id"}, "$$cid"]},
                                    {"$eq": ["$ID", "$$cid"]},
                                    {"$eq": [{"$toString": "$ID"}, "$$cid"]},
                                    {"$eq": [{"$toString": "$_id"}, "$$cid"]}
                                ]
                            }
                        }}
                    ],
                    "as": "client" # Map directly to 'client' field for Pydantic
                }
            },
            {
                "$unwind": {
                    "path": "$client",
                    "preserveNullAndEmptyArrays": True
                }
            }
        ])

        # 3. Filter by client category if needed (School or Distributor)
        if client_category and client_category.lower() != "both":
            pipeline.append(
                {"$match": {"client.Client Catagory (*)": client_category}}
            )
            
        cursor = self.collection.aggregate(pipeline)
        
        tasks = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                    
                # Handle nested client ObjectId if present
                if "client" in doc and doc["client"]:
                    if "_id" in doc["client"]:
                        doc["client"]["_id"] = str(doc["client"]["_id"])

                tasks.append(TaskInDB(**doc))
            except Exception as e:
                print(f"Error validating task in analytics: {e}")
                continue
        
        print(f"[DEBUG] Found {len(tasks)} tasks matching filters")
        return tasks

    async def aggregate_tasks_area_wise(
        self,
        start_date: date,
        employee_id: str,
        end_date: date,
        client_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get area-wise unique clients with their tasks for an employee.
        """
        # Convert to UTC-aware datetime
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        # Match tasks first using checkinTime
        match_stage = {
            "checkinTime": {"$gte": start_dt, "$lte": end_dt},
            "$or": [
                {"employeeID": employee_id},
                {"internalEmpID": employee_id}
            ]
        }
        
        pipeline = [
            {"$match": match_stage},
            # Join with clients immediately to get area info
            {
                "$lookup": {
                    "from": "clients",
                    "let": {"cid": "$clientID"},
                    "pipeline": [
                        {"$match": {
                            "$expr": {
                                "$or": [
                                    {"$eq": ["$unolo_client_id", "$$cid"]},
                                    {"$eq": [{"$toString": "$unolo_client_id"}, "$$cid"]}
                                ]
                            }
                        }}
                    ],
                    "as": "client_info"
                }
            },
            {
                "$unwind": {
                    "path": "$client_info",
                    "preserveNullAndEmptyArrays": True
                }
            }
        ]
        
        # Filter by client category if specified (ONLY if linked to a client)
        if client_category and client_category.lower() != "both":
            pipeline.append({"$match": {"client_info.Client Catagory (*)": client_category}})
            
        # Group by Area (Division Name new) and Client
        pipeline.extend([
            {
                "$group": {
                    "_id": {
                        "area": "$client_info.Division Name new (*)",
                        "client_id": "$client_info._id"  # Use internal _id instead of external ID
                    },
                    "client": {"$first": "$client_info"},
                    "tasks": {"$push": "$$ROOT"},
                    "task_count": {"$sum": 1}
                }
            },
            # Cleanup tasks: remove client_info from task docs inside the array
            {
                "$project": {
                    "client": 1,
                    "tasks": 1,
                    "task_count": 1,
                    "_id": 0,
                    "area": "$_id.area"
                }
            },
            # Now group by Area to form the final structure
            {
                "$group": {
                    "_id": "$area",
                    "clients_with_tasks": {
                        "$push": {
                            "client": "$client",
                            "tasks": "$tasks",
                            "task_count": "$task_count"
                        }
                    },
                    "unique_clients": {"$sum": 1}
                }
            }
        ])
        
        cursor = self.collection.aggregate(pipeline)
        
        area_stats = {}
        
        async for doc in cursor:
            # Map None/empty area to "unassigned" to match ClientRepository
            area = doc["_id"]
            if not area:
                area = "unassigned"
            
            # Fix ObjectId serialization for clients and tasks
            clients_with_tasks = doc["clients_with_tasks"]
            for item in clients_with_tasks:
                # Handle potential missing client if we preserved empty arrays
                if item.get("client"):
                    if "_id" in item["client"]:
                        item["client"]["_id"] = str(item["client"]["_id"])
                else:
                    # Initialize empty client dict if missing
                    item["client"] = {}
                
                # Also ensure task _id is converted if present
                if "tasks" in item:
                    for t in item["tasks"]:
                        if "_id" in t:
                            t["_id"] = str(t["_id"])

            area_stats[area] = {
                "unique_clients": doc["unique_clients"],
                "clients_with_tasks": clients_with_tasks
            }
            
        return area_stats

    async def get_latest_tasks_grouped_by_school_category(
        self,
        employee_id: str,
        start_date: date,
        end_date: date,
        client_category: Optional[str] = None
    ) -> Dict[str, List[Dict]]:
        """
        Get latest task per client (school), grouped by schoolCategory (Hot/Cold/Warm/NoInfo).
        Each school appears only once with its most recent task.
        """
        # Convert to UTC-aware datetime
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        pipeline = [
            # 1. Match tasks using checkinTime
            {
                "$match": {
                    "checkinTime": {"$gte": start_dt, "$lte": end_dt},
                    "$or": [
                        {"employeeID": employee_id},
                        {"internalEmpID": employee_id}
                    ]
                }
            },
            # 2. Lookup client info FIRST (before grouping)
            {
                "$lookup": {
                    "from": "clients",
                    "let": {"cid": "$clientID"},
                    "pipeline": [
                        {"$match": {
                            "$expr": {
                                "$or": [
                                    {"$eq": ["$unolo_client_id", "$$cid"]},
                                    {"$eq": [{"$toString": "$unolo_client_id"}, "$$cid"]},
                                    {"$eq": ["$ID", "$$cid"]},
                                    {"$eq": [{"$toString": "$ID"}, "$$cid"]},
                                    {"$eq": [{"$toString": "$_id"}, "$$cid"]}
                                ]
                            }
                        }}
                    ],
                    "as": "client_info"
                }
            },
            {
                "$unwind": {
                    "path": "$client_info",
                    "preserveNullAndEmptyArrays": True
                }
            },
            # 3. Sort by checkinTime desc (most recent first)
            {"$sort": {"checkinTime": -1}},
            # 4. Group by the CLIENT's actual _id (not clientID from task) to ensure unique schools
            {
                "$group": {
                    "_id": "$client_info._id",
                    "latest_task": {"$first": "$$ROOT"},
                    "client_info": {"$first": "$client_info"}
                }
            }
        ]
        
        # Filter by client category if specified
        if client_category and client_category.lower() != "both":
            pipeline.append({"$match": {"client_info.Client Catagory (*)": client_category}})
            
        cursor = self.collection.aggregate(pipeline)
        
        results = {"Hot": [], "Cold": [], "Warm": [], "NoInfo": []}
        
        async for doc in cursor:
            task = doc["latest_task"]
            client = doc.get("client_info", {}) # Default to empty dict
            
            # Skip if no valid client (tasks without matched clients)
            if not client or not doc.get("_id"):
                continue
            
            # Fix ObjectId serialization
            if client and "_id" in client:
                client["_id"] = str(client["_id"])
            if "_id" in task:
                task["_id"] = str(task["_id"])
            
            # Remove nested client_info from task to avoid duplication
            if "client_info" in task:
                del task["client_info"]
            
            # Extract schoolCategory from metadata
            metadata = task.get("metadata", {})
            cats = metadata.get("schoolCategory", [])
            
            category = "NoInfo"
            if cats and isinstance(cats, list) and len(cats) > 0:
                val = cats[0] 
                if val in ["Hot", "Cold", "Warm"]:
                    category = val
            
            # Format item
            item = {
                "client": client,
                "latest_task": task,
                "school_category": category
            }
            
            if category in results:
                results[category].append(item)
            else:
                results["NoInfo"].append(item)
                
        return results

    async def find_all_tasks_in_date_range(
        self,
        start_date: date,
        end_date: date
    ) -> List[TaskInDB]:
        """
        Find all tasks within date range (no employee filter).
        """
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        cursor = self.collection.find({
            "checkinTime": {"$gte": start_dt, "$lte": end_dt}
        })
        
        tasks = []
        async for doc in cursor:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            tasks.append(TaskInDB(**doc))
            
        return tasks

    async def aggregate_tasks_by_employee(
        self,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Group tasks by employeeID and count them.
        Returns: List of {employee_id: str, count: int}
        """
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        pipeline = [
            {"$match": {"checkinTime": {"$gte": start_dt, "$lte": end_dt}}},
            {
                "$group": {
                    "_id": "$employeeID", # Group by Unolo EmployeeID (or internalEmpID if consistent)
                    "count": {"$sum": 1}
                }
            }
        ]
        
        cursor = self.collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    async def get_hot_schools_by_employee(
        self,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get unique schools with 'Hot' category from latest task in range.
        Grouped by the employee who performed that latest task.
        """
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        pipeline = [
            # 1. Match tasks in range
            {"$match": {"checkinTime": {"$gte": start_dt, "$lte": end_dt}}},
            
            # 2. Sort latest first
            {"$sort": {"checkinTime": -1}},
            
            # 3. Group by Client to get latest task
            {
                "$group": {
                    "_id": "$clientID",
                    "latest_task": {"$first": "$$ROOT"}
                }
            },
            
            # 4. Project school category
            {
                "$project": {
                    "employeeID": "$latest_task.employeeID",
                    "school_category": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$latest_task.metadata.schoolCategory", 0]},
                            "$latest_task.metadata.schoolCategory",
                            "NoInfo"
                        ]
                    }
                }
            },
            
            # 5. Filter for 'Hot'
            {"$match": {"school_category": "Hot"}},
            
            # 6. Group by Employee
            {
                "$group": {
                    "_id": "$employeeID",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        cursor = self.collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    async def find_all_tasks_with_clients(
        self,
        start_date: date,
        end_date: date,
        employee_id: Optional[str] = None,
        filter_type: Optional[str] = None
    ) -> List[TaskInDB]:
        """
        Find tasks with client lookup, optionally filtered by employee and type.
        Used for admin drill-down.
        """
        start_dt = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59, tzinfo=timezone.utc)
        
        match_stage = {"checkinTime": {"$gte": start_dt, "$lte": end_dt}}
        
        if employee_id:
            match_stage["$or"] = [
                {"employeeID": employee_id},
                {"internalEmpID": employee_id}
            ]
            
        pipeline = [
            {"$match": match_stage},
            {"$sort": {"checkinTime": -1}}
        ]
        
        if filter_type == 'specimens':
             pipeline.append({
                 "$match": {
                     "$and": [
                         {"metadata.specimensGiven": {"$exists": True}},
                         {"metadata.specimensGiven": {"$ne": "0"}},
                         {"metadata.specimensGiven": {"$ne": 0}},
                         {"metadata.specimensGiven": {"$ne": ""}}
                     ]
                 }
             })
        elif filter_type == 'hot_schools':
             pipeline.append({
                 "$match": {
                     "metadata.schoolCategory": "Hot"
                 }
             })
             
        pipeline.extend([
            {
                "$lookup": {
                    "from": "clients",
                    "let": {"cid": "$clientID"},
                    "pipeline": [
                        {"$match": {
                            "$expr": {
                                "$or": [
                                    {"$eq": ["$unolo_client_id", "$$cid"]},
                                    {"$eq": [{"$toString": "$unolo_client_id"}, "$$cid"]},
                                    {"$eq": ["$ID", "$$cid"]},
                                    {"$eq": [{"$toString": "$ID"}, "$$cid"]},
                                    {"$eq": [{"$toString": "$_id"}, "$$cid"]}
                                ]
                            }
                        }}
                    ],
                    "as": "client"
                }
            },
            {
                "$unwind": {
                    "path": "$client",
                    "preserveNullAndEmptyArrays": True
                }
            }
        ])
        
        cursor = self.collection.aggregate(pipeline)
        
        tasks = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                if "client" in doc and doc["client"]:
                    if "_id" in doc["client"]:
                        doc["client"]["_id"] = str(doc["client"]["_id"])
                
                tasks.append(TaskInDB(**doc))
            except Exception as e:
                print(f"Error validating task in admin drill-down: {e}")
                continue
                
        return tasks

# Global instance
task_repository = TaskRepository()
