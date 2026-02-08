"""
EOD Summary Repository
"""
from typing import List, Tuple, Any, Dict, Optional
from datetime import datetime, date

from app.database import db_manager
from app.models.eod_summary import EodSummaryInDB
from app.schemas.unolo import UnoloEodSummaryResponse

class EodSummaryRepository:
    def __init__(self):
        self.collection_name = "eod_summaries"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def upsert(self, data: UnoloEodSummaryResponse) -> Any:
        """
        Upsert EOD summary based on employeeID and date.
        """
        # Convert Pydantic model to dict
        data_dict = data.model_dump(by_alias=True, exclude_none=True)
        
        # Add local timestamps
        now = datetime.utcnow()
        data_dict["updated_at_local"] = now
        
        # Use $setOnInsert for created_at_local
        update_op = {
            "$set": data_dict,
            "$setOnInsert": {"created_at_local": now}
        }
        
        if "created_at_local" in update_op["$set"]:
            del update_op["$set"]["created_at_local"]

        # Unique key: employeeID + date
        return await self.collection.update_one(
            {
                "employeeID": data.employee_id,
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
    ) -> Tuple[List[EodSummaryInDB], int]:
        """
        Find EOD summaries matching query with pagination.
        """
        total_count = await self.collection.count_documents(filters)
        cursor = self.collection.find(filters).sort("date", -1).skip(skip).limit(limit)
        
        results = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                results.append(EodSummaryInDB(**doc))
            except Exception as e:
                print(f"Error validating EOD summary {doc.get('_id')}: {e}")
                continue
            
        return results, total_count

eod_summary_repository = EodSummaryRepository()
