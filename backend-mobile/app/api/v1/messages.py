from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user_id, get_message_service
from app.schemas.messages import SendMessageRequest
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("")
async def list_conversations(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[MessageService, Depends(get_message_service)],
) -> list[dict[str, Any]]:
    return await service.list_conversations(user_id)


@router.get("/{peer_user_id}")
async def list_messages(
    peer_user_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[MessageService, Depends(get_message_service)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    before: Annotated[datetime | None, Query()] = None,
) -> list[dict[str, Any]]:
    return await service.list_history(
        user_id,
        peer_user_id,
        limit=limit,
        before=before,
    )


@router.post("/{peer_user_id}", status_code=201)
async def send_message(
    peer_user_id: str,
    payload: SendMessageRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[MessageService, Depends(get_message_service)],
) -> dict[str, Any]:
    return await service.send_message(user_id, peer_user_id, payload.content)


@router.put("/{peer_user_id}/read")
async def mark_messages_read(
    peer_user_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[MessageService, Depends(get_message_service)],
) -> dict[str, Any]:
    return await service.mark_read(user_id, peer_user_id)
