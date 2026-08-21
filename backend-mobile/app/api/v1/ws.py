"""Chat WebSocket — notify only. No message writes over this channel."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_access_token
from app.services.chat_hub import chat_hub

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat-ws"])


@router.websocket("/ws/chat")
async def chat_websocket(
    websocket: WebSocket,
    token: str = Query(..., min_length=10),
) -> None:
    try:
        payload = decode_access_token(token)
    except ValueError:
        await websocket.close(code=4401)
        return

    user_id = payload.get("sub")
    if not user_id or not isinstance(user_id, str):
        await websocket.close(code=4401)
        return

    await chat_hub.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Clients may ping; never accept send_message or other writes here.
            if isinstance(data, dict) and data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.debug("chat ws loop ended user=%s", user_id, exc_info=True)
    finally:
        await chat_hub.disconnect(user_id, websocket)
