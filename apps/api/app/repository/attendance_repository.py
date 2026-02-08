"""
Attendance Repository
"""
from typing import List, Tuple, Any, Dict, Optional
from datetime import datetime, date

from app.database import db_manager
from app.models.attendance import AttendanceInDB
from app.schemas.unolo import UnoloAttendanceResponse

class AttendanceRepository:
    def __init__(self):
        self.collection_name = "attendance"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def upsert(self, data: UnoloAttendanceResponse) -> Any:
        """
        Upsert Attendance based on userID and date.
        """
        data_dict = data.model_dump(by_alias=True, exclude_none=True)
        
        now = datetime.utcnow()
        data_dict["updated_at_local"] = now
        
        update_op = {
            "$set": data_dict,
            "$setOnInsert": {"created_at_local": now}
        }
        
        if "created_at_local" in update_op["$set"]:
            del update_op["$set"]["created_at_local"]

        # Unique key: userID + date
        return await self.collection.update_one(
            {
                "userID": data.user_id,
                "date": data.date
            },
            update_op,
            upsert=True
        )

    async def find_with_filters(
        self,  
        filters: Dict[str, Any], 
        limit: int, 
        skip: int
    ) -> Tuple[List[AttendanceInDB], int]:
        """
        Find Attendance records matching query with pagination.
        """
        total_count = await self.collection.count_documents(filters)
        cursor = self.collection.find(filters).sort("date", -1).skip(skip).limit(limit)
        
        results = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                results.append(AttendanceInDB(**doc))
            except Exception as e:
                print(f"Error validating Attendance {doc.get('_id')}: {e}")
                continue
            
        return results, total_count

attendance_repository = AttendanceRepository()
