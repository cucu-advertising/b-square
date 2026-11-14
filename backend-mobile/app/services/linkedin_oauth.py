"""LinkedIn Sign In (OpenID Connect) integration.

Flow:
1. Mobile app opens LinkedIn's authorization URL in an in-app browser.
2. LinkedIn redirects to our backend's /auth/linkedin/callback with a `code`.
3. That endpoint redirects into the app via a custom URL scheme, carrying the code.
4. The app POSTs the code to /auth/linkedin/exchange.
5. This module exchanges the code for tokens and verifies the ID token,
   returning the member's LinkedIn subject id, email, and name.
"""

from typing import Any

import httpx
from jose import jwk
from jose import jwt as jose_jwt

from app.core.config import get_settings
from app.core.exceptions import AppError

_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
_JWKS_URL = "https://www.linkedin.com/oauth/openid/jwks"


def build_authorization_url(state: str) -> str:
    settings = get_settings()
    params = httpx.QueryParams(
        {
            "response_type": "code",
            "client_id": settings.linkedin_client_id,
            "redirect_uri": settings.linkedin_redirect_uri,
            "state": state,
            "scope": "openid profile email",
        }
    )
    return f"https://www.linkedin.com/oauth/v2/authorization?{params}"


async def exchange_code_for_claims(code: str) -> dict[str, Any]:
    """Exchanges an authorization code for an ID token and returns its verified claims."""
    settings = get_settings()
    if not settings.linkedin_client_id or not settings.linkedin_client_secret:
        raise AppError("LinkedIn sign-in is not configured on the server", 500)

    async with httpx.AsyncClient(timeout=10.0) as client:
        token_response = await client.post(
            _TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.linkedin_redirect_uri,
                "client_id": settings.linkedin_client_id,
                "client_secret": settings.linkedin_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_response.status_code != 200:
            raise AppError("LinkedIn sign-in failed: could not exchange code", 401)
        token_data = token_response.json()
        id_token = token_data.get("id_token")
        if not id_token:
            raise AppError("LinkedIn sign-in failed: no ID token returned", 401)

        jwks_response = await client.get(_JWKS_URL)
        if jwks_response.status_code != 200:
            raise AppError("LinkedIn sign-in failed: could not verify token", 401)
        jwks = jwks_response.json()

    try:
        unverified_header = jose_jwt.get_unverified_header(id_token)
        kid = unverified_header.get("kid")
        matching_key = next(
            (k for k in jwks.get("keys", []) if k.get("kid") == kid), None
        )
        if matching_key is None:
            raise AppError("LinkedIn sign-in failed: unknown signing key", 401)
        public_key = jwk.construct(matching_key, algorithm="RS256")
        claims = jose_jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=settings.linkedin_client_id,
            issuer="https://www.linkedin.com/oauth",
        )
    except AppError:
        raise
    except Exception as exc:  # jose raises several JWTError subtypes
        raise AppError("LinkedIn sign-in failed: invalid token", 401) from exc

    return claims
