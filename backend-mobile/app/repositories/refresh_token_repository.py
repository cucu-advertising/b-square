from datetime import datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


class RefreshTokenRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.refresh_tokens

    async def save(self, user_id: str, token: str, expires_at: datetime) -> None:
        await self.collection.insert_one(
            {
                "user_id": user_id,
                "token": token,
                "expires_at": expires_at,
            }
        )

    async def find_valid(self, token: str) -> dict[str, Any] | None:
        return await self.collection.find_one(
            {
                "token": token,
                "expires_at": {"$gt": datetime.utcnow()},
            }
        )

    async def delete(self, token: str) -> None:
        await self.collection.delete_one({"token": token})

    async def delete_all_for_user(self, user_id: str) -> None:
        await self.collection.delete_many({"user_id": user_id})
