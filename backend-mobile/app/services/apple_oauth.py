"""Sign in with Apple integration.

Unlike LinkedIn, Apple's native SDK on iOS hands the client an already-issued
identityToken (a signed JWT) directly — no server-side code exchange needed.
The client sends us that token; we just need to verify its signature against
Apple's public keys and check it was actually issued for our app.
"""

from typing import Any

import httpx
from jose import jwk
from jose import jwt as jose_jwt

from app.core.config import get_settings
from app.core.exceptions import AppError

_JWKS_URL = "https://appleid.apple.com/auth/keys"


async def verify_identity_token(identity_token: str) -> dict[str, Any]:
    settings = get_settings()

    async with httpx.AsyncClient(timeout=10.0) as client:
        jwks_response = await client.get(_JWKS_URL)
        if jwks_response.status_code != 200:
            raise AppError("Apple sign-in failed: could not verify token", 401)
        jwks = jwks_response.json()

    try:
        unverified_header = jose_jwt.get_unverified_header(identity_token)
        kid = unverified_header.get("kid")
        matching_key = next(
            (k for k in jwks.get("keys", []) if k.get("kid") == kid), None
        )
        if matching_key is None:
            raise AppError("Apple sign-in failed: unknown signing key", 401)
        public_key = jwk.construct(matching_key, algorithm="RS256")

        # The native iOS SDK issues tokens with aud = your app's bundle ID.
        expected_audience = settings.apple_bundle_id or None
        claims = jose_jwt.decode(
            identity_token,
            public_key,
            algorithms=["RS256"],
            audience=expected_audience,
            issuer="https://appleid.apple.com",
            options={"verify_aud": bool(expected_audience)},
        )
    except AppError:
        raise
    except Exception as exc:  # jose raises several JWTError subtypes
        raise AppError("Apple sign-in failed: invalid token", 401) from exc

    return claims
