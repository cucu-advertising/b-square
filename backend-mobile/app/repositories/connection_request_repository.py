from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ConnectionRequestRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.connection_requests

    async def create(self, from_user_id: str, to_user_id: str) -> dict[str, Any]:
        now = datetime.utcnow()
        document = {
            "fromUserId": from_user_id,
            "toUserId": to_user_id,
            "status": "pending",
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def find_by_id(self, request_id: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(request_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(request_id)})

    async def find_pending_between(
        self, user_a: str, user_b: str
    ) -> dict[str, Any] | None:
        return await self.collection.find_one(
            {
                "status": "pending",
                "$or": [
                    {"fromUserId": user_a, "toUserId": user_b},
                    {"fromUserId": user_b, "toUserId": user_a},
                ],
            }
        )

    async def list_received(self, user_id: str) -> list[dict[str, Any]]:
        cursor = self.collection.find(
            {"toUserId": user_id, "status": "pending"}
        ).sort("createdAt", -1)
        return await cursor.to_list(length=100)

    async def list_sent(self, user_id: str) -> list[dict[str, Any]]:
        cursor = self.collection.find(
            {"fromUserId": user_id, "status": "pending"}
        ).sort("createdAt", -1)
        return await cursor.to_list(length=100)

    async def list_related_user_ids(self, user_id: str) -> list[str]:
        """Users with any pending/accepted request involving this user."""
        cursor = self.collection.find(
            {
                "$or": [{"fromUserId": user_id}, {"toUserId": user_id}],
                "status": {"$in": ["pending", "accepted"]},
            },
            {"fromUserId": 1, "toUserId": 1},
        )
        rows = await cursor.to_list(length=1000)
        related: set[str] = set()
        for row in rows:
            if row.get("fromUserId") and row["fromUserId"] != user_id:
                related.add(row["fromUserId"])
            if row.get("toUserId") and row["toUserId"] != user_id:
                related.add(row["toUserId"])
        return list(related)

    async def update_status(self, request_id: str, status: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(request_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": status, "updatedAt": datetime.utcnow()}},
        )
        return await self.find_by_id(request_id)

    async def count_by_status_for_recipient(
        self, user_id: str, status: str
    ) -> int:
        return await self.collection.count_documents(
            {"toUserId": user_id, "status": status}
        )

    async def count_accepted_involving(self, user_id: str) -> int:
        return await self.collection.count_documents(
            {
                "status": "accepted",
                "$or": [{"fromUserId": user_id}, {"toUserId": user_id}],
            }
        )
