from datetime import datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


class ProfileViewRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.profile_views

    async def record(self, profile_user_id: str, viewer_user_id: str) -> None:
        if profile_user_id == viewer_user_id:
            return
        now = datetime.utcnow()
        await self.collection.update_one(
            {
                "profileUserId": profile_user_id,
                "viewerUserId": viewer_user_id,
            },
            {
                "$set": {"lastViewedAt": now},
                "$setOnInsert": {
                    "profileUserId": profile_user_id,
                    "viewerUserId": viewer_user_id,
                    "createdAt": now,
                },
                "$inc": {"viewCount": 1},
            },
            upsert=True,
        )

    async def unique_viewer_count(self, profile_user_id: str) -> int:
        return await self.collection.count_documents(
            {"profileUserId": profile_user_id}
        )
