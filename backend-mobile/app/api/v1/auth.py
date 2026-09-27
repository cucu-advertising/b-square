import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.api.deps import get_auth_service, get_current_user_id
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.schemas.auth import (
    ForgotPasswordRequest,
    LinkedInExchangeRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services import linkedin_oauth
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


@router.get("/linkedin/authorize-url")
async def linkedin_authorize_url() -> dict:
    state = secrets.token_urlsafe(16)
    return {"url": linkedin_oauth.build_authorization_url(state), "state": state}


@router.get("/linkedin/callback")
async def linkedin_callback(code: str = "", state: str = "", error: str = "") -> RedirectResponse:
    """LinkedIn redirects here after the user approves/denies access.

    We hand off to the app via its custom URL scheme, carrying the code
    (or error) along so the app can complete the exchange itself.
    """
    settings = get_settings()
    scheme = settings.linkedin_app_redirect_scheme
    if error:
        return RedirectResponse(url=f"{scheme}://linkedin-callback?error={error}")
    return RedirectResponse(
        url=f"{scheme}://linkedin-callback?code={code}&state={state}"
    )


@router.post("/linkedin/exchange")
async def linkedin_exchange(
    payload: LinkedInExchangeRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    claims = await linkedin_oauth.exchange_code_for_claims(payload.code)
    user, tokens, is_new_user = await auth_service.linkedin_auth(claims)
    return {
        "user": user.model_dump(by_alias=True),
        "isNewUser": is_new_user,
        **tokens.model_dump(by_alias=True),
    }


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    await auth_service.request_password_reset(payload.email, str(request.base_url))
    # Always the same response, regardless of whether the email exists.
    return {"message": "If that email exists, a reset link has been sent."}


_RESET_PAGE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset your password</title>
  <style>
    body {{ font-family: -apple-system, sans-serif; background: #0B1020; color: #fff;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }}
    .card {{ background: #151B33; padding: 32px; border-radius: 16px; width: 100%; max-width: 360px; }}
    h2 {{ margin-top: 0; }}
    input {{ width: 100%; padding: 12px; margin: 8px 0 16px; border-radius: 8px; border: 1px solid #2E3858;
             background: #0B1020; color: #fff; box-sizing: border-box; font-size: 15px; }}
    button {{ width: 100%; padding: 12px; border-radius: 8px; border: none; background: #7c5cff;
              color: #fff; font-weight: bold; font-size: 15px; cursor: pointer; }}
    .msg {{ color: {msg_color}; margin-bottom: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <h2>Reset your password</h2>
    {body}
  </div>
</body>
</html>
"""


@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password_page(token: str = "") -> HTMLResponse:
    if not token:
        body = '<p class="msg">This reset link is missing a token.</p>'
        return HTMLResponse(_RESET_PAGE_TEMPLATE.format(body=body, msg_color="#ff6b6b"))
    body = f"""
      <form method="post" action="/api/v1/auth/reset-password">
        <input type="hidden" name="token" value="{token}">
        <input type="password" name="new_password" placeholder="New password" minlength="8" required>
        <button type="submit">Set new password</button>
      </form>
    """
    return HTMLResponse(_RESET_PAGE_TEMPLATE.format(body=body, msg_color="#fff"))


@router.post("/reset-password", response_class=HTMLResponse)
async def reset_password_submit(
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    token: Annotated[str, Form()],
    new_password: Annotated[str, Form()],
) -> HTMLResponse:
    try:
        await auth_service.reset_password(token, new_password)
    except AppError as e:
        body = f'<p class="msg">{e.message}</p>'
        return HTMLResponse(_RESET_PAGE_TEMPLATE.format(body=body, msg_color="#ff6b6b"))
    body = '<p class="msg">Your password has been reset. You can now sign in from the app.</p>'
    return HTMLResponse(_RESET_PAGE_TEMPLATE.format(body=body, msg_color="#6bffb3"))
