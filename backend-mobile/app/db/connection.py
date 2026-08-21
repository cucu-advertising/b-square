from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client.get_default_database()
    await _ensure_indexes()


async def close_db() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database is not initialized")
    return _db


async def _ensure_indexes() -> None:
    db = get_db()
    await db.users.create_index("email", unique=True)
    await _ensure_unique_index(db.users, "dinNumber", sparse=True)
    await _migrate_refresh_token_indexes(db.refresh_tokens)
    await db.refresh_tokens.create_index("token", unique=True)
    await db.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)
    await _ensure_connection_indexes(db)
    await _ensure_notification_indexes(db)
    await _ensure_discover_pass_indexes(db)
    await _ensure_profile_view_indexes(db)
    await _ensure_message_indexes(db)


async def _ensure_connection_indexes(db: AsyncIOMotorDatabase) -> None:
    """Indexes for connection_requests + connections (created on first ensure)."""
    requests = db.connection_requests
    await requests.create_index(
        [("fromUserId", 1), ("toUserId", 1), ("status", 1)],
        name="from_to_status",
    )
    await requests.create_index(
        [("toUserId", 1), ("status", 1), ("createdAt", -1)],
        name="received_inbox",
    )
    await requests.create_index(
        [("fromUserId", 1), ("status", 1), ("createdAt", -1)],
        name="sent_list",
    )
    # At most one pending request per direction.
    await requests.create_index(
        [("fromUserId", 1), ("toUserId", 1)],
        name="unique_pending_pair",
        unique=True,
        partialFilterExpression={"status": "pending"},
    )

    connections = db.connections
    await connections.create_index(
        [("userAId", 1), ("userBId", 1)],
        name="unique_connection_pair",
        unique=True,
    )
    await connections.create_index("userAId", name="connections_user_a")
    await connections.create_index("userBId", name="connections_user_b")


async def _ensure_notification_indexes(db: AsyncIOMotorDatabase) -> None:
    """Indexes for Messages-tab notification inbox."""
    notifications = db.notifications
    await notifications.create_index(
        [("userId", 1), ("createdAt", -1)],
        name="user_feed",
    )
    await notifications.create_index(
        [("userId", 1), ("isRead", 1)],
        name="user_unread",
    )
    await notifications.create_index(
        [("userId", 1), ("requestId", 1)],
        name="user_request",
        sparse=True,
    )


async def _ensure_discover_pass_indexes(db: AsyncIOMotorDatabase) -> None:
    """Indexes so passed discover profiles stay hidden after refresh."""
    passes = db.discover_passes
    await passes.create_index(
        [("fromUserId", 1), ("targetUserId", 1)],
        name="unique_discover_pass",
        unique=True,
    )
    await passes.create_index("fromUserId", name="discover_passes_from_user")


async def _ensure_profile_view_indexes(db: AsyncIOMotorDatabase) -> None:
    views = db.profile_views
    await views.create_index(
        [("profileUserId", 1), ("viewerUserId", 1)],
        name="unique_profile_viewer",
        unique=True,
    )
    await views.create_index("profileUserId", name="profile_views_by_profile")


async def _ensure_message_indexes(db: AsyncIOMotorDatabase) -> None:
    """Indexes for 1:1 chat conversations + messages."""
    conversations = db.conversations
    await conversations.create_index(
        [("userAId", 1), ("userBId", 1)],
        name="unique_conversation_pair",
        unique=True,
    )
    await conversations.create_index(
        [("userAId", 1), ("lastMessageAt", -1)],
        name="conversations_user_a_recent",
    )
    await conversations.create_index(
        [("userBId", 1), ("lastMessageAt", -1)],
        name="conversations_user_b_recent",
    )

    messages = db.messages
    await messages.create_index(
        [("conversationId", 1), ("createdAt", -1)],
        name="messages_by_conversation",
    )
    await messages.create_index(
        [("receiverId", 1), ("readAt", 1)],
        name="messages_unread_by_receiver",
    )


async def _migrate_refresh_token_indexes(collection) -> None:
    """Drop legacy tokenHash index that conflicts with the current token field."""
    existing = await collection.index_information()
    if "tokenHash_1" in existing:
        await collection.drop_index("tokenHash_1")
    # Remove docs written under the old schema (tokenHash missing / null).
    await collection.delete_many({"$or": [{"token": {"$exists": False}}, {"token": None}]})


async def _ensure_unique_index(collection, field: str, *, sparse: bool = False) -> None:
    index_name = f"{field}_1"
    existing = await collection.index_information()
    current = existing.get(index_name)
    if current is not None and not current.get("unique"):
        await collection.drop_index(index_name)
    await collection.create_index(field, sparse=sparse, unique=True)
