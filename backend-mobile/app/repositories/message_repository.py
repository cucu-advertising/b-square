from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class MessageRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.messages

    async def create(
        self,
        *,
        conversation_id: str,
        sender_id: str,
        receiver_id: str,
        content: str,
    ) -> dict[str, Any]:
        now = datetime.utcnow()
        document = {
            "conversationId": conversation_id,
            "senderId": sender_id,
            "receiverId": receiver_id,
            "content": content,
            "createdAt": now,
            "readAt": None,
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def list_for_conversation(
        self,
        conversation_id: str,
        *,
        limit: int = 50,
        before: datetime | None = None,
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"conversationId": conversation_id}
        if before is not None:
            query["createdAt"] = {"$lt": before}

        cursor = (
            self.collection.find(query)
            .sort("createdAt", -1)
            .limit(max(1, min(limit, 100)))
        )
        rows = await cursor.to_list(length=limit)
        rows.reverse()
        return rows

    async def mark_read_for_receiver(
        self, conversation_id: str, receiver_id: str
    ) -> int:
        result = await self.collection.update_many(
            {
                "conversationId": conversation_id,
                "receiverId": receiver_id,
                "readAt": None,
            },
            {"$set": {"readAt": datetime.utcnow()}},
        )
        return int(result.modified_count)

    async def find_by_id(self, message_id: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(message_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(message_id)})
