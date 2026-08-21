from datetime import datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError


class DiscoverPassRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.discover_passes

    async def create(self, from_user_id: str, target_user_id: str) -> dict[str, Any]:
        document = {
            "fromUserId": from_user_id,
            "targetUserId": target_user_id,
            "createdAt": datetime.utcnow(),
        }
        try:
            result = await self.collection.insert_one(document)
            document["_id"] = result.inserted_id
            return document
        except DuplicateKeyError:
            existing = await self.collection.find_one(
                {"fromUserId": from_user_id, "targetUserId": target_user_id}
            )
            return existing or document

    async def list_target_ids(self, from_user_id: str) -> list[str]:
        cursor = self.collection.find({"fromUserId": from_user_id}, {"targetUserId": 1})
        rows = await cursor.to_list(length=1000)
        return [row["targetUserId"] for row in rows if row.get("targetUserId")]
