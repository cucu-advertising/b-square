from typing import Annotated

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.db.connection import get_db
from app.repositories.connection_repository import ConnectionRepository
from app.repositories.connection_request_repository import ConnectionRequestRepository
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.discover_pass_repository import DiscoverPassRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.profile_view_repository import ProfileViewRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.connection_service import ConnectionService
from app.services.message_service import MessageService

security = HTTPBearer(auto_error=False)


def get_user_repository() -> UserRepository:
    return UserRepository(get_db())


def get_refresh_token_repository() -> RefreshTokenRepository:
    return RefreshTokenRepository(get_db())


def get_connection_request_repository() -> ConnectionRequestRepository:
    return ConnectionRequestRepository(get_db())


def get_connection_repository() -> ConnectionRepository:
    return ConnectionRepository(get_db())


def get_notification_repository() -> NotificationRepository:
    return NotificationRepository(get_db())


def get_discover_pass_repository() -> DiscoverPassRepository:
    return DiscoverPassRepository(get_db())


def get_profile_view_repository() -> ProfileViewRepository:
    return ProfileViewRepository(get_db())


def get_conversation_repository() -> ConversationRepository:
    return ConversationRepository(get_db())


def get_message_repository() -> MessageRepository:
    return MessageRepository(get_db())


def get_auth_service(
    users: Annotated[UserRepository, Depends(get_user_repository)],
    refresh_tokens: Annotated[RefreshTokenRepository, Depends(get_refresh_token_repository)],
) -> AuthService:
    return AuthService(users, refresh_tokens)


def get_connection_service(
    users: Annotated[UserRepository, Depends(get_user_repository)],
    requests: Annotated[ConnectionRequestRepository, Depends(get_connection_request_repository)],
    connections: Annotated[ConnectionRepository, Depends(get_connection_repository)],
    notifications: Annotated[NotificationRepository, Depends(get_notification_repository)],
    passes: Annotated[DiscoverPassRepository, Depends(get_discover_pass_repository)],
    profile_views: Annotated[ProfileViewRepository, Depends(get_profile_view_repository)],
) -> ConnectionService:
    return ConnectionService(
        users, requests, connections, notifications, passes, profile_views
    )


def get_message_service(
    users: Annotated[UserRepository, Depends(get_user_repository)],
    connections: Annotated[ConnectionRepository, Depends(get_connection_repository)],
    conversations: Annotated[ConversationRepository, Depends(get_conversation_repository)],
    messages: Annotated[MessageRepository, Depends(get_message_repository)],
) -> MessageService:
    return MessageService(users, connections, conversations, messages)


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    token: str | None = None
    if credentials is not None:
        token = credentials.credentials
    elif authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]

    if not token:
        raise AppError("Authentication required", 401)

    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise AppError(str(exc), 401) from exc

    subject = payload.get("sub")
    if not subject:
        raise AppError("Invalid token payload", 401)
    return subject
