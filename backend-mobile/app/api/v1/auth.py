from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_auth_service, get_current_user_id
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(
    payload: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    user, tokens = await auth_service.register(payload)
    return {"user": user.model_dump(by_alias=True), **tokens.model_dump(by_alias=True)}


@router.post("/login")
async def login(
    payload: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    user, tokens = await auth_service.login(payload)
    return {"user": user.model_dump(by_alias=True), **tokens.model_dump(by_alias=True)}


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    payload: RefreshRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenResponse:
    return await auth_service.refresh(payload.refresh_token)


@router.post("/logout", status_code=204)
async def logout(
    payload: RefreshRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> None:
    await auth_service.logout(payload.refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(
    user_id: Annotated[str, Depends(get_current_user_id)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserResponse:
    return await auth_service.get_me(user_id)
