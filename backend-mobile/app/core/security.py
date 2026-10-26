from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

_DURATION_UNITS = {"s": 1, "m": 60, "h": 3600, "d": 86400}


def _parse_duration(value: str) -> timedelta:
    value = value.strip().lower()
    if value.isdigit():
        return timedelta(seconds=int(value))
    unit = value[-1]
    amount = int(value[:-1])
    if unit not in _DURATION_UNITS:
        raise ValueError(f"Unsupported duration unit: {unit}")
    return timedelta(seconds=amount * _DURATION_UNITS[unit])


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + _parse_duration(settings.jwt_expires_in)
    payload = {"sub": subject, "type": "access", "exp": expire}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(subject: str) -> tuple[str, datetime]:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + _parse_duration(settings.jwt_refresh_expires_in)
    token = jwt.encode(
        {"sub": subject, "type": "refresh", "exp": expire},
        settings.jwt_refresh_secret,
        algorithm="HS256",
    )
    return token, expire


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except JWTError as exc:
        raise ValueError("Invalid or expired access token") from exc
    if payload.get("type") != "access":
        raise ValueError("Invalid token type")
    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_refresh_secret, algorithms=["HS256"])
    except JWTError as exc:
        raise ValueError("Invalid or expired refresh token") from exc
    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type")
    return payload
