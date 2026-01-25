"""
Client Repository
"""
from typing import List, Tuple, Any, Dict
from app.database import db_manager
from app.schemas.client import Client

class ClientRepository:
    def __init__(self):
        self.collection_name = "clients"
    
    @property
    def collection(self):
        return db_manager.get_collection(self.collection_name)

    async def find_with_filters(self, query: Dict[str, Any], skip: int, limit: int) -> Tuple[List[Client], int]:
        """
        Find clients matching query with pagination.
        Returns: (List[Client], total_count)
        """
        # Get total count for pagination
        total_count = await self.collection.count_documents(query)
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        
        clients = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                clients.append(Client(**doc))
            except Exception as e:
                print(f"Error validating client data: {e}")
                continue
            
        return clients, total_count

    async def find_clients_by_employee(
        self, 
        employee_id: str, 
        client_category: str = None
    ) -> List[Client]:
        """
        Find all clients for a specific employee (visible_to OR created_by).
        Optionally filter by client_category.
        """
        query = {
            "$or": [
                {"Visible To (*)": employee_id},
                {"Employee ID": employee_id}
            ]
        }
        
        if client_category:
            query["Client Catagory (*)"] = client_category
            
        cursor = self.collection.find(query)
        
        clients = []
        async for doc in cursor:
            try:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                clients.append(Client(**doc))
            except Exception as e:
                print(f"Error validating client data: {e}")
                continue
                
        return clients

    async def aggregate_clients_grouped(
        self, 
        employee_id: str, 
        group_field: str,
        client_category: str = None
    ) -> Tuple[Dict[str, List[Client]], List[Client], int]:
        """
        Aggregate clients for an employee, grouped by a specific field.
        Returns: (groups_dict, unassigned_list, total_count)
        """
        match_stage = {
            "$or": [
                {"Visible To (*)": employee_id},
                {"Employee ID": employee_id}
            ]
        }
        
        if client_category:
            match_stage["Client Catagory (*)"] = client_category

        pipeline = [
            {"$match": match_stage},
            {"$group": {
                "_id": {
                    "$cond": {
                        "if": {"$and": [{"$ne": [f"${group_field}", None]}, {"$ne": [f"${group_field}", ""]}]},
                        "then": f"${group_field}",
                        "else": "unassigned"
                    }
                },
                "clients": {"$push": "$$ROOT"},
                "count": {"$sum": 1}
            }}
        ]
        
        cursor = self.collection.aggregate(pipeline)
        
        groups = {}
        unassigned = []
        total_count = 0
        
        async for doc in cursor:
            group_key = doc["_id"]
            client_docs = doc["clients"]
            
            client_objs = []
            for c_doc in client_docs:
                try:
                    if "_id" in c_doc:
                        c_doc["_id"] = str(c_doc["_id"])
                    client_objs.append(Client(**c_doc))
                except Exception as e:
                    print(f"Error validating client in aggregation: {e}")
                    continue
            
            total_count += len(client_objs)
            
            if group_key == "unassigned":
                unassigned.extend(client_objs)
            else:
                groups[group_key] = client_objs
                
        return groups, unassigned, total_count

# Global instance
client_repository = ClientRepository()
