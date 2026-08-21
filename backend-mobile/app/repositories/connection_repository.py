from datetime import datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


def sorted_pair(user_a: str, user_b: str) -> tuple[str, str]:
    return (user_a, user_b) if user_a < user_b else (user_b, user_a)


class ConnectionRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.connections

    async def exists(self, user_a: str, user_b: str) -> bool:
        a, b = sorted_pair(user_a, user_b)
        doc = await self.collection.find_one({"userAId": a, "userBId": b})
        return doc is not None

    async def create(self, user_a: str, user_b: str) -> dict[str, Any]:
        a, b = sorted_pair(user_a, user_b)
        document = {
            "userAId": a,
            "userBId": b,
            "createdAt": datetime.utcnow(),
        }
        try:
            result = await self.collection.insert_one(document)
            document["_id"] = result.inserted_id
        except Exception:
            existing = await self.collection.find_one({"userAId": a, "userBId": b})
            if existing:
                return existing
            raise
        return document

    async def list_for_user(self, user_id: str) -> list[dict[str, Any]]:
        cursor = self.collection.find(
            {"$or": [{"userAId": user_id}, {"userBId": user_id}]}
        ).sort("createdAt", -1)
        return await cursor.to_list(length=200)

    async def list_peer_ids(self, user_id: str) -> list[str]:
        rows = await self.list_for_user(user_id)
        peers: list[str] = []
        for row in rows:
            peer = row["userBId"] if row["userAId"] == user_id else row["userAId"]
            if peer:
                peers.append(peer)
        return peers

    async def count_for_user(self, user_id: str) -> int:
        return await self.collection.count_documents(
            {"$or": [{"userAId": user_id}, {"userBId": user_id}]}
        )
