from typing import List, Optional
from datetime import date
from app.database import db_manager
from app.models.eod_summary import EodSummaryInDB

class EmpAnalyticsRepository:
    def __init__(self):
        self.collection_name = "eod_summaries"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def get_employee_eod_data(
        self,
        employee_id: str,
        start_date: date,
        end_date: date
    ) -> List[EodSummaryInDB]:
        """
        Fetch all EOD summaries for employee in date range.
        """
        query = {
            "employeeID": int(employee_id) if employee_id.isdigit() else employee_id,
            "date": {
                "$gte": start_date.strftime("%Y-%m-%d"),
                "$lte": end_date.strftime("%Y-%m-%d")
            }
        }
        
        cursor = self.collection.find(query).sort("date", 1)
        results = []
        
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                results.append(EodSummaryInDB(**doc))
            except Exception as e:
                # Log error but continue
                print(f"Error parsing EOD summary: {e}")
                continue
                
        return results

emp_analytics_repository = EmpAnalyticsRepository()
