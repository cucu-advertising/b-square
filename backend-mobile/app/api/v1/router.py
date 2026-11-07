from fastapi import APIRouter

from app.api.v1 import auth, connections, email_code, firebase_phone, signup_email, health, messages, notifications, users, ws

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(email_code.router)
api_router.include_router(signup_email.router)
api_router.include_router(firebase_phone.router)
api_router.include_router(users.router)
api_router.include_router(connections.router)
api_router.include_router(notifications.router)
api_router.include_router(messages.router)
api_router.include_router(ws.router)
