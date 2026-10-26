"""In-memory WebSocket hub for chat notifications only.

Hard rule: this module never validates content or writes to MongoDB.
REST handlers save first, then call send_to_user to notify online peers.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ChatHub:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(user_id, set()).add(websocket)
        logger.debug("chat ws connected user=%s", user_id)

    async def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            sockets = self._connections.get(user_id)
            if not sockets:
                return
            sockets.discard(websocket)
            if not sockets:
                self._connections.pop(user_id, None)
        logger.debug("chat ws disconnected user=%s", user_id)

    async def send_to_user(self, user_id: str, payload: dict[str, Any]) -> None:
        async with self._lock:
            sockets = list(self._connections.get(user_id, set()))

        if not sockets:
            return

        dead: list[WebSocket] = []
        for websocket in sockets:
            try:
                await websocket.send_json(payload)
            except Exception:
                logger.debug("chat ws send failed user=%s", user_id, exc_info=True)
                dead.append(websocket)

        for websocket in dead:
            await self.disconnect(user_id, websocket)


chat_hub = ChatHub()
