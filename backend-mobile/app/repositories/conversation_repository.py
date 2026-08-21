from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.connection_repository import sorted_pair


class ConversationRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.conversations

    async def find_between(self, user_a: str, user_b: str) -> dict[str, Any] | None:
        a, b = sorted_pair(user_a, user_b)
        return await self.collection.find_one({"userAId": a, "userBId": b})

    async def get_or_create(self, user_a: str, user_b: str) -> dict[str, Any]:
        existing = await self.find_between(user_a, user_b)
        if existing:
            return existing

        a, b = sorted_pair(user_a, user_b)
        now = datetime.utcnow()
        document = {
            "userAId": a,
            "userBId": b,
            "lastMessage": "",
            "lastMessageAt": now,
            "lastSenderId": None,
            "unreadFor": {a: 0, b: 0},
            "createdAt": now,
            "updatedAt": now,
        }
        try:
            result = await self.collection.insert_one(document)
            document["_id"] = result.inserted_id
            return document
        except Exception:
            existing = await self.find_between(user_a, user_b)
            if existing:
                return existing
            raise

    async def touch_after_message(
        self,
        conversation_id: str,
        *,
        content: str,
        sender_id: str,
        receiver_id: str,
        created_at: datetime,
    ) -> None:
        if not ObjectId.is_valid(conversation_id):
            return
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {
                    "lastMessage": content,
                    "lastMessageAt": created_at,
                    "lastSenderId": sender_id,
                    "updatedAt": created_at,
                },
                "$inc": {f"unreadFor.{receiver_id}": 1},
            },
        )

    async def clear_unread(self, conversation_id: str, user_id: str) -> None:
        if not ObjectId.is_valid(conversation_id):
            return
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {f"unreadFor.{user_id}": 0, "updatedAt": datetime.utcnow()}},
        )

    async def list_for_user(self, user_id: str, *, limit: int = 50) -> list[dict[str, Any]]:
        cursor = self.collection.find(
            {"$or": [{"userAId": user_id}, {"userBId": user_id}]}
        ).sort("lastMessageAt", -1)
        return await cursor.to_list(length=max(1, min(limit, 100)))
