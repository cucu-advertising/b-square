from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def find_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_reset_token(self, token: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"resetPasswordToken": token})

    async def find_by_id(self, user_id: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def find_by_din(self, din_number: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"dinNumber": din_number})

    async def find_by_linkedin_sub(self, sub: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"oauthLinkedinSub": sub})

    async def find_by_apple_sub(self, sub: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"oauthAppleSub": sub})

    async def list_discoverable(
        self,
        exclude_user_id: str,
        *,
        exclude_ids: list[str] | None = None,
        interests: list[str] | None = None,
        industry: str | None = None,
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
        # Exclude anyone the viewer has blocked, or who has blocked the viewer.
        query["blockedUserIds"] = {"$ne": exclude_user_id}
        if interests:
            query["businessInterests"] = {"$in": interests}
        if industry:
            query["industry"] = industry

        cursor = (
            self.collection.find(query)
            .sort("createdAt", -1)
            .limit(max(1, min(limit, 100)))
        )
        rows = await cursor.to_list(length=limit)
        if exclude_user_id:
            rows = [
                row
                for row in rows
                if exclude_user_id not in (row.get("blockedUserIds") or [])
            ]
        return rows

    async def block_user(self, user_id: str, target_id: str) -> None:
        if not ObjectId.is_valid(user_id):
            return
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$addToSet": {"blockedUserIds": target_id},
                "$set": {"updatedAt": datetime.utcnow()},
            },
        )

    async def unblock_user(self, user_id: str, target_id: str) -> None:
        if not ObjectId.is_valid(user_id):
            return
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$pull": {"blockedUserIds": target_id},
                "$set": {"updatedAt": datetime.utcnow()},
            },
        )

    async def has_blocked(self, user_id: str, target_id: str) -> bool:
        user = await self.find_by_id(user_id)
        if not user:
            return False
        return target_id in (user.get("blockedUserIds") or [])

    async def create(self, document: dict[str, Any]) -> dict[str, Any]:
        # A sparse unique index only skips documents where the field is
        # entirely ABSENT, not documents where it's present with value null.
        # Since every signup builds this document with dinNumber defaulted
        # to None, non-DIN signups (LinkedIn/succession) would otherwise all
        # collide on a shared null value. Remove the key outright instead.
        if document.get("dinNumber") is None:
            document.pop("dinNumber", None)
        if document.get("oauthLinkedinSub") is None:
            document.pop("oauthLinkedinSub", None)
        if document.get("oauthAppleSub") is None:
            document.pop("oauthAppleSub", None)
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def update(self, user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None
        updates["updatedAt"] = datetime.utcnow()
        await self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
        return await self.find_by_id(user_id)
