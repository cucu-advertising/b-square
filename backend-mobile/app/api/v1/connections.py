from typing import Annotated, Any

from fastapi import APIRouter, Depends

from app.api.deps import get_connection_service, get_current_user_id
from app.services.connection_service import ConnectionService

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/request/{target_user_id}")
async def send_connection_request(
    target_user_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await service.send_request(user_id, target_user_id)


@router.put("/request/{request_id}/accept")
async def accept_connection_request(
    request_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await service.accept_request(user_id, request_id)


@router.put("/request/{request_id}/decline")
async def decline_connection_request(
    request_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await service.decline_request(user_id, request_id)


@router.delete("/request/{request_id}")
async def cancel_connection_request(
    request_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await service.cancel_request(user_id, request_id)


@router.get("/requests/received")
async def list_received_requests(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> list[dict[str, Any]]:
    return await service.list_received(user_id)


@router.get("/requests/sent")
async def list_sent_requests(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> list[dict[str, Any]]:
    return await service.list_sent(user_id)


@router.get("")
async def list_connections(
    user_id: Annotated[str, Depends(get_current_user_id)],
    service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> list[dict[str, Any]]:
    return await service.list_connections(user_id)
