from typing import Annotated, Any

from fastapi import APIRouter, Depends

from app.api.deps import get_connection_service, get_current_user_id
from app.services.connection_service import ConnectionService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> list[dict[str, Any]]:
    return await service.list_notifications(user_id)


@router.get("/unread-count")
async def unread_notification_count(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, int]:
    return await service.unread_count(user_id)


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, str]:
    return await service.mark_notification_read(user_id, notification_id)


@router.put("/read-all")
async def mark_all_notifications_read(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, str]:
    return await service.mark_all_notifications_read(user_id)
