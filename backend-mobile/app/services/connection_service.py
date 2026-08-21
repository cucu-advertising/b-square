from typing import Any

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import AppError
from app.repositories.connection_repository import ConnectionRepository
from app.repositories.connection_request_repository import ConnectionRequestRepository
from app.repositories.discover_pass_repository import DiscoverPassRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.profile_view_repository import ProfileViewRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import serialize_user
from app.schemas.auth import UserResponse


def _display_name(user: dict[str, Any]) -> str:
    founder = (user.get("founderName") or "").strip()
    if founder:
        return founder
    first = (user.get("firstName") or "").strip()
    last = (user.get("lastName") or "").strip()
    full = f"{first} {last}".strip()
    return full or "Member"


def _role_company(user: dict[str, Any]) -> str:
    role = (user.get("role") or "").strip()
    company = (user.get("companyName") or user.get("businessName") or "").strip()
    if role and company:
        return f"{role} at {company}"
    return role or company or "BSquare member"


def _serialize_user_preview(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(user["_id"]),
        "name": _display_name(user),
        "roleCompany": _role_company(user),
        "location": (user.get("city") or "").strip() or "India",
        "profilePhoto": user.get("profilePhoto"),
        "companyName": (user.get("companyName") or user.get("businessName") or "").strip(),
    }


class ConnectionService:
    def __init__(
        self,
        users: UserRepository,
        requests: ConnectionRequestRepository,
        connections: ConnectionRepository,
        notifications: NotificationRepository,
        passes: DiscoverPassRepository,
        profile_views: ProfileViewRepository,
    ):
        self.users = users
        self.requests = requests
        self.connections = connections
        self.notifications = notifications
        self.passes = passes
        self.profile_views = profile_views

    async def discover_users(self, user_id: str) -> list[UserResponse]:
        excluded = set(await self.passes.list_target_ids(user_id))
        excluded.update(await self.connections.list_peer_ids(user_id))
        excluded.update(await self.requests.list_related_user_ids(user_id))
        users = await self.users.list_discoverable(
            user_id,
            exclude_ids=list(excluded),
        )
        return [serialize_user(user) for user in users]

    async def pass_profile(self, from_user_id: str, target_user_id: str) -> dict[str, str]:
        if from_user_id == target_user_id:
            raise AppError("You cannot pass on yourself", 400)
        target = await self.users.find_by_id(target_user_id)
        if not target:
            raise AppError("User not found", 404)
        await self.passes.create(from_user_id, target_user_id)
        return {"message": "Profile passed"}

    async def send_request(self, from_user_id: str, to_user_id: str) -> dict[str, Any]:
        if from_user_id == to_user_id:
            raise AppError("You cannot send a request to yourself", 400)

        target = await self.users.find_by_id(to_user_id)
        if not target:
            raise AppError("User not found", 404)

        sender = await self.users.find_by_id(from_user_id)
        if not sender:
            raise AppError("User not found", 404)

        if await self.connections.exists(from_user_id, to_user_id):
            raise AppError("You are already connected with this user", 409)

        existing = await self.requests.find_pending_between(from_user_id, to_user_id)
        if existing:
            if existing["fromUserId"] == from_user_id:
                raise AppError("Connection request already sent. Waiting for their response.", 409)

            # Mutual: they already requested you → auto-accept
            request_id = str(existing["_id"])
            await self.requests.update_status(request_id, "accepted")
            await self.connections.create(from_user_id, to_user_id)
            await self.notifications.mark_request_read(from_user_id, request_id)
            await self._notify_accepted(existing["fromUserId"], from_user_id, request_id)
            return {
                "status": "connected",
                "requestId": request_id,
                "message": "Connected! They had already sent you a request.",
            }

        try:
            request = await self.requests.create(from_user_id, to_user_id)
        except DuplicateKeyError as exc:
            raise AppError(
                "Connection request already sent. Waiting for their response.", 409
            ) from exc

        request_id = str(request["_id"])
        sender_name = _display_name(sender)
        await self.notifications.create(
            user_id=to_user_id,
            type="connection_request",
            title="New connection request",
            body=f"{sender_name} wants to connect",
            from_user_id=from_user_id,
            request_id=request_id,
        )
        return {
            "status": "pending",
            "requestId": request_id,
            "message": "Connection request sent successfully",
        }

    async def accept_request(self, user_id: str, request_id: str) -> dict[str, Any]:
        request = await self.requests.find_by_id(request_id)
        if not request or request.get("status") != "pending":
            raise AppError("Request not found or already handled", 404)
        if request["toUserId"] != user_id:
            raise AppError("Only the recipient can accept this request", 403)

        await self.requests.update_status(request_id, "accepted")
        await self.connections.create(request["fromUserId"], request["toUserId"])
        await self.notifications.mark_request_read(user_id, request_id)
        await self._notify_accepted(request["fromUserId"], user_id, request_id)
        return {"message": "Connection accepted", "status": "connected"}

    async def decline_request(self, user_id: str, request_id: str) -> dict[str, Any]:
        request = await self.requests.find_by_id(request_id)
        if not request or request.get("status") != "pending":
            raise AppError("Request not found or already handled", 404)
        if request["toUserId"] != user_id:
            raise AppError("Only the recipient can decline this request", 403)

        await self.requests.update_status(request_id, "declined")
        await self.notifications.mark_request_read(user_id, request_id)

        receiver = await self.users.find_by_id(user_id)
        receiver_name = _display_name(receiver) if receiver else "A member"
        await self.notifications.create(
            user_id=request["fromUserId"],
            type="connection_declined",
            title="Connection declined",
            body=f"{receiver_name} declined your connection request",
            from_user_id=user_id,
            request_id=request_id,
        )
        return {"message": "Request declined", "status": "declined"}

    async def cancel_request(self, user_id: str, request_id: str) -> dict[str, Any]:
        request = await self.requests.find_by_id(request_id)
        if not request or request.get("status") != "pending":
            raise AppError("Request not found or already handled", 404)
        if request["fromUserId"] != user_id:
            raise AppError("Only the sender can cancel this request", 403)

        await self.requests.update_status(request_id, "cancelled")
        await self.notifications.mark_request_read(request["toUserId"], request_id)
        return {"message": "Request cancelled", "status": "cancelled"}

    async def list_received(self, user_id: str) -> list[dict[str, Any]]:
        rows = await self.requests.list_received(user_id)
        return await self._hydrate_requests(rows, peer_field="fromUserId")

    async def list_sent(self, user_id: str) -> list[dict[str, Any]]:
        rows = await self.requests.list_sent(user_id)
        return await self._hydrate_requests(rows, peer_field="toUserId")

    async def list_connections(self, user_id: str) -> list[dict[str, Any]]:
        rows = await self.connections.list_for_user(user_id)
        results: list[dict[str, Any]] = []
        for row in rows:
            peer_id = row["userBId"] if row["userAId"] == user_id else row["userAId"]
            peer = await self.users.find_by_id(peer_id)
            if not peer:
                continue
            preview = _serialize_user_preview(peer)
            preview["connectedAt"] = row.get("createdAt")
            results.append(preview)
        return results

    async def record_profile_view(
        self, viewer_user_id: str, profile_user_id: str
    ) -> dict[str, str]:
        if viewer_user_id == profile_user_id:
            return {"message": "Skipped self view"}
        target = await self.users.find_by_id(profile_user_id)
        if not target:
            raise AppError("User not found", 404)
        await self.profile_views.record(profile_user_id, viewer_user_id)
        return {"message": "View recorded"}

    async def profile_stats(self, user_id: str) -> dict[str, Any]:
        connections = await self.connections.count_for_user(user_id)
        matches = await self.requests.count_accepted_involving(user_id)
        profile_views = await self.profile_views.unique_viewer_count(user_id)
        accepted = await self.requests.count_by_status_for_recipient(
            user_id, "accepted"
        )
        declined = await self.requests.count_by_status_for_recipient(
            user_id, "declined"
        )
        decided = accepted + declined
        response_rate = round((accepted / decided) * 100) if decided else 0
        return {
            "connections": connections,
            "profileViews": profile_views,
            "matches": matches,
            "responseRate": response_rate,
        }

    async def list_notifications(self, user_id: str) -> list[dict[str, Any]]:
        rows = await self.notifications.list_for_user(user_id)
        results: list[dict[str, Any]] = []
        for row in rows:
            actor = await self.users.find_by_id(row["fromUserId"])
            preview = _serialize_user_preview(actor) if actor else {
                "id": row["fromUserId"],
                "name": "Member",
                "roleCompany": "",
                "location": "",
                "profilePhoto": None,
                "companyName": "",
            }
            results.append(
                {
                    "id": str(row["_id"]),
                    "type": row["type"],
                    "title": row["title"],
                    "body": row["body"],
                    "fromUserId": row["fromUserId"],
                    "fromUserName": preview["name"],
                    "fromCompanyName": preview["companyName"],
                    "fromProfilePhoto": preview["profilePhoto"],
                    "fromRoleCompany": preview["roleCompany"],
                    "fromLocation": preview["location"],
                    "requestId": row.get("requestId"),
                    "isRead": bool(row.get("isRead")),
                    "createdAt": row.get("createdAt"),
                }
            )
        return results

    async def unread_count(self, user_id: str) -> dict[str, int]:
        return {"count": await self.notifications.unread_count(user_id)}

    async def mark_notification_read(self, user_id: str, notification_id: str) -> dict[str, str]:
        ok = await self.notifications.mark_read(notification_id, user_id)
        if not ok:
            raise AppError("Notification not found", 404)
        return {"message": "Marked as read"}

    async def mark_all_notifications_read(self, user_id: str) -> dict[str, str]:
        await self.notifications.mark_all_read(user_id)
        return {"message": "All notifications marked as read"}

    async def _notify_accepted(
        self, sender_id: str, accepter_id: str, request_id: str
    ) -> None:
        accepter = await self.users.find_by_id(accepter_id)
        name = _display_name(accepter) if accepter else "A member"
        await self.notifications.create(
            user_id=sender_id,
            type="connection_accepted",
            title="Request approved",
            body=f"{name} has approved your connection request",
            from_user_id=accepter_id,
            request_id=request_id,
        )

    async def _hydrate_requests(
        self, rows: list[dict[str, Any]], *, peer_field: str
    ) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        for row in rows:
            peer = await self.users.find_by_id(row[peer_field])
            if not peer:
                continue
            preview = _serialize_user_preview(peer)
            results.append(
                {
                    "id": str(row["_id"]),
                    "status": row["status"],
                    "fromUserId": row["fromUserId"],
                    "toUserId": row["toUserId"],
                    "createdAt": row.get("createdAt"),
                    "user": preview,
                }
            )
        return results
