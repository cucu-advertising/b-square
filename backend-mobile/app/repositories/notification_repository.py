from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class NotificationRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.notifications

    async def create(
        self,
        *,
        user_id: str,
        type: str,
        title: str,
        body: str,
        from_user_id: str,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        document = {
            "userId": user_id,
            "type": type,
            "title": title,
            "body": body,
            "fromUserId": from_user_id,
            "requestId": request_id,
            "isRead": False,
            "createdAt": datetime.utcnow(),
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def list_for_user(self, user_id: str, *, limit: int = 50) -> list[dict[str, Any]]:
        cursor = (
            self.collection.find({"userId": user_id})
            .sort("createdAt", -1)
            .limit(max(1, min(limit, 100)))
        )
        return await cursor.to_list(length=limit)

    async def unread_count(self, user_id: str) -> int:
        return await self.collection.count_documents({"userId": user_id, "isRead": False})

    async def mark_read(self, notification_id: str, user_id: str) -> bool:
        if not ObjectId.is_valid(notification_id):
            return False
        result = await self.collection.update_one(
            {"_id": ObjectId(notification_id), "userId": user_id},
            {"$set": {"isRead": True}},
        )
        return result.matched_count > 0

    async def mark_all_read(self, user_id: str) -> None:
        await self.collection.update_many(
            {"userId": user_id, "isRead": False},
            {"$set": {"isRead": True}},
        )

    async def mark_request_read(self, user_id: str, request_id: str) -> None:
        await self.collection.update_many(
            {"userId": user_id, "requestId": request_id, "isRead": False},
            {"$set": {"isRead": True}},
        )
