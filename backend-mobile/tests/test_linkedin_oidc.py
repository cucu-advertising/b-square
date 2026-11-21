"""Check LinkedIn OIDC ID tokens against LinkedIn's actual discovery issuer.

The LinkedIn OpenID discovery document identifies
https://www.linkedin.com as issuer, not /oauth. This test prevents
a valid production sign-in being rejected by issuer mismatch.
"""
import asyncio
import base64
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from jose import jwt

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.services import linkedin_oauth


def _b64_int(value):
    return base64.urlsafe_b64encode(value.to_bytes((value.bit_length() + 7) // 8, "big")).rstrip(b"=").decode()


def _fake_provider(monkeypatch, issuer: str):
    s = get_settings()
    monkeypatch.setattr(s, "linkedin_client_id", "bsquare-ci-client")
    monkeypatch.setattr(s, "linkedin_client_secret", "bsquare-ci-secret")
    monkeypatch.setattr(s, "linkedin_redirect_uri", "https://example.com/callback")
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_numbers = private_key.public_key().public_numbers()
    pem = private_key.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    )
    token = jwt.encode({
        "iss": issuer,
        "aud": s.linkedin_client_id,
        "sub": "test-subject",
        "email": "founder@company.example",
        "email_verified": True,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }, pem, algorithm="RS256", headers={"kid": "ci-kid"})
    jwks = {"keys": [{
        "kty": "RSA", "kid": "ci-kid", "alg": "RS256", "use": "sig",
        "n": _b64_int(public_numbers.n), "e": _b64_int(public_numbers.e),
    }]}
    class Response:
        def __init__(self, status_code, payload):
            self.status_code = status_code
            self.payload = payload
        def json(self):
            return self.payload

    class Client:
        def __init__(self, **_): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *_): pass
        async def post(self, url, **_):
            assert url == "https://www.linkedin.com/oauth/v2/accessToken"
            return Response(200, {"id_token": token, "access_token": "fake-test-token"})
        async def get(self, url, **_):
            if url.endswith("/userinfo"):
                return Response(200, {
                    "sub": "test-subject", "name": "Test Founder",
                    "email": "founder@company.example", "email_verified": True,
                })
            if url.endswith("/jwks"): return Response(200, jwks)
            raise AssertionError(f"Unexpected OAuth endpoint: {url}")

    monkeypatch.setattr(linkedin_oauth.httpx, "AsyncClient", Client)


def test_real_linkedin_oidc_issuer_is_accepted(monkeypatch):
    _fake_provider(monkeypatch, "https://www.linkedin.com")
    claims = asyncio.run(linkedin_oauth.exchange_code_for_claims("test-code"))
    assert claims["sub"] == "test-subject"
    assert claims["email_verified"] is True


def test_wrong_linkedin_oidc_issuer_is_rejected(monkeypatch):
    _fake_provider(monkeypatch, "https://evil.example")
    try:
        asyncio.run(linkedin_oauth.exchange_code_for_claims("test-code"))
    except AppError as exc:
        assert exc.status_code == 401
    else:
        raise AssertionError("An unexpected OIDC issuer was accepted")
