import httpx

from app.core.config import get_settings

_RESEND_URL = "https://api.resend.com/emails"


async def send_password_reset_email(*, to_email: str, reset_url: str) -> None:
    settings = get_settings()
    if not settings.resend_api_key:
        # No API key configured — skip silently in dev rather than crash the
        # request. In production this should always be set.
        return

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Reset your B Square password</h2>
      <p>We received a request to reset your password. Click the button below
      to choose a new one. This link expires in 1 hour.</p>
      <p style="margin: 24px 0;">
        <a href="{reset_url}"
           style="background: #7c5cff; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    """

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(
                _RESEND_URL,
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": settings.resend_from_email,
                    "to": [to_email],
                    "subject": "Reset your B Square password",
                    "html": html,
                },
            )
            response.raise_for_status()
        except httpx.HTTPError:
            # A flaky email provider shouldn't surface as a 500 to the user,
            # and the request-reset endpoint always returns success
            # regardless, to avoid leaking whether an email exists.
            pass
