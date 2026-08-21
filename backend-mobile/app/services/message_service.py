from datetime import datetime
from typing import Any

from app.core.exceptions import AppError
from app.repositories.connection_repository import ConnectionRepository
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.user_repository import UserRepository
from app.services.chat_hub import chat_hub


def _display_name(user: dict[str, Any]) -> str:
    founder = (user.get("founderName") or "").strip()
    if founder:
        return founder
    first = (user.get("firstName") or "").strip()
    last = (user.get("lastName") or "").strip()
    full = f"{first} {last}".strip()
    return full or "Member"


def _iso(value: Any) -> Any:
    if isinstance(value, datetime):
        # Stored as naive UTC from repositories.
        return value.isoformat() + "Z"
    return value


def _serialize_message(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(row["_id"]),
        "conversationId": row["conversationId"],
        "senderId": row["senderId"],
        "receiverId": row["receiverId"],
        "content": row["content"],
        "createdAt": _iso(row.get("createdAt")),
        "readAt": _iso(row.get("readAt")),
    }


class MessageService:
    def __init__(
        self,
        users: UserRepository,
        connections: ConnectionRepository,
        conversations: ConversationRepository,
        messages: MessageRepository,
    ):
        self.users = users
        self.connections = connections
        self.conversations = conversations
        self.messages = messages

    async def _require_connected(self, user_id: str, peer_id: str) -> None:
        if user_id == peer_id:
            raise AppError("You cannot message yourself", 400)
        peer = await self.users.find_by_id(peer_id)
        if not peer:
            raise AppError("User not found", 404)
        if not await self.connections.exists(user_id, peer_id):
            raise AppError("You must be connected to message this user", 403)

    async def send_message(
        self, sender_id: str, peer_id: str, content: str
    ) -> dict[str, Any]:
        await self._require_connected(sender_id, peer_id)
        conversation = await self.conversations.get_or_create(sender_id, peer_id)
        conversation_id = str(conversation["_id"])

        message = await self.messages.create(
            conversation_id=conversation_id,
            sender_id=sender_id,
            receiver_id=peer_id,
            content=content,
        )
        await self.conversations.touch_after_message(
            conversation_id,
            content=content,
            sender_id=sender_id,
            receiver_id=peer_id,
            created_at=message["createdAt"],
        )
        serialized = _serialize_message(message)

        # Doorbell only — never save on the WebSocket path.
        await chat_hub.send_to_user(
            peer_id,
            {"type": "message.new", "message": serialized},
        )
        return serialized

    async def list_history(
        self,
        user_id: str,
        peer_id: str,
        *,
        limit: int = 50,
        before: datetime | None = None,
    ) -> list[dict[str, Any]]:
        await self._require_connected(user_id, peer_id)
        conversation = await self.conversations.find_between(user_id, peer_id)
        if not conversation:
            return []

        conversation_id = str(conversation["_id"])
        rows = await self.messages.list_for_conversation(
            conversation_id,
            limit=limit,
            before=before,
        )
        return [_serialize_message(row) for row in rows]

    async def mark_read(self, user_id: str, peer_id: str) -> dict[str, Any]:
        await self._require_connected(user_id, peer_id)
        conversation = await self.conversations.find_between(user_id, peer_id)
        if not conversation:
            return {"updated": 0}

        conversation_id = str(conversation["_id"])
        updated = await self.messages.mark_read_for_receiver(conversation_id, user_id)
        await self.conversations.clear_unread(conversation_id, user_id)

        if updated:
            await chat_hub.send_to_user(
                peer_id,
                {
                    "type": "message.read",
                    "conversationId": conversation_id,
                    "readerId": user_id,
                    "updated": updated,
                },
            )
        return {"updated": updated}

    async def list_conversations(self, user_id: str) -> list[dict[str, Any]]:
        rows = await self.conversations.list_for_user(user_id)
        results: list[dict[str, Any]] = []
        for row in rows:
            peer_id = row["userBId"] if row["userAId"] == user_id else row["userAId"]
            peer = await self.users.find_by_id(peer_id)
            if not peer:
                continue
            unread_map = row.get("unreadFor") or {}
            results.append(
                {
                    "id": str(row["_id"]),
                    "peerUserId": peer_id,
                    "peerName": _display_name(peer),
                    "peerProfilePhoto": peer.get("profilePhoto"),
                    "peerCompanyName": (
                        peer.get("companyName") or peer.get("businessName") or ""
                    ).strip(),
                    "lastMessage": row.get("lastMessage") or "",
                    "lastMessageAt": _iso(row.get("lastMessageAt")),
                    "lastSenderId": row.get("lastSenderId"),
                    "unreadCount": int(unread_map.get(user_id, 0) or 0),
                }
            )
        return results
