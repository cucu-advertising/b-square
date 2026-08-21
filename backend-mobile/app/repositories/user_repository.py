from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def find_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_id(self, user_id: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def find_by_din(self, din_number: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"dinNumber": din_number})

    async def list_discoverable(
        self,
        exclude_user_id: str,
        *,
        exclude_ids: list[str] | None = None,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        excluded: list[ObjectId] = []
        if ObjectId.is_valid(exclude_user_id):
            excluded.append(ObjectId(exclude_user_id))
        for user_id in exclude_ids or []:
            if ObjectId.is_valid(user_id):
                oid = ObjectId(user_id)
                if oid not in excluded:
                    excluded.append(oid)

        query: dict[str, Any] = {}
        if excluded:
            query["_id"] = {"$nin": excluded}

        cursor = (
            self.collection.find(query)
            .sort("createdAt", -1)
            .limit(max(1, min(limit, 100)))
        )
        return await cursor.to_list(length=limit)

    async def create(self, document: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def update(self, user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None
        updates["updatedAt"] = datetime.utcnow()
        await self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
        return await self.find_by_id(user_id)
