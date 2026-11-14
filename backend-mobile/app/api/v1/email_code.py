"""Passwordless email OTP for existing B Square accounts.

The code proves mailbox possession; it never creates or auto-approves members.
Codes are HMAC-hashed at rest, short-lived, single-use and attempt-limited.
"""
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.api.deps import get_auth_service
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.db.connection import get_db
from app.services.auth_service import AuthService, serialize_user
from app.services.email_service import send_login_code_email

router = APIRouter(prefix="/auth/email-code", tags=["auth"])
CODE_LIFETIME = timedelta(minutes=5)
COOLDOWN = timedelta(seconds=60)
RATE_WINDOW = timedelta(hours=1)
MAX_PER_EMAIL = 5
MAX_PER_IP = 60
MAX_ATTEMPTS = 5


class RequestEmailCode(BaseModel):
    email: EmailStr


class VerifyEmailCode(BaseModel):
    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")


def _digest(email: str, code: str) -> str:
    secret = get_settings().jwt_secret.encode("utf-8")
    return hmac.new(secret, f"email-login:{email}:{code}".encode("utf-8"), hashlib.sha256).hexdigest()


async def _consume_rate_limit(key: str, limit: int, now: datetime) -> bool:
    """Atomic hourly counter, keyed by hashed email or remote IP."""
    collection = get_db().email_login_rate_limits
    # Indexes are created on application startup. The expiry field is TTL indexed.
    updated = await collection.find_one_and_update(
        {"_id": key, "windowUntil": {"$gt": now}, "count": {"$lt": limit}},
        {"$inc": {"count": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if updated is not None:
        return True

    existing = await collection.find_one({"_id": key})
    if existing is not None and existing.get("windowUntil", now) > now:
        return False
    if existing is not None:
        result = await collection.update_one(
            {"_id": key, "windowUntil": {"$lte": now}},
            {"$set": {"count": 1, "windowUntil": now + RATE_WINDOW}},
        )
        return bool(result.modified_count)
    try:
        await collection.insert_one({"_id": key, "count": 1, "windowUntil": now + RATE_WINDOW})
        return True
    except DuplicateKeyError:
        return False


@router.post("/request")
async def request_email_code(payload: RequestEmailCode, request: Request) -> dict[str, str]:
    email = str(payload.email).strip().lower()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    # Consistent response prevents attackers from identifying registered emails.
    response = {"message": "If this email is registered, a verification code will be sent."}
    ip = request.client.host if request.client else "unknown"
    ip_key = "ip:" + hmac.new(
        get_settings().jwt_secret.encode(), ip.encode(), hashlib.sha256
    ).hexdigest()
    email_key = "email:" + hmac.new(
        get_settings().jwt_secret.encode(), email.encode(), hashlib.sha256
    ).hexdigest()

    if not await _consume_rate_limit(ip_key, MAX_PER_IP, now):
        return response
    if not await _consume_rate_limit(email_key, MAX_PER_EMAIL, now):
        return response

    collection = get_db().email_login_codes
    record = await collection.find_one({"_id": email})
    if record and record.get("lastSentAt") and record["lastSentAt"] > now - COOLDOWN:
        return response

    # Codes must never be issued for accounts not already registered.
    user = await get_db().users.find_one({"email": email}, {"_id": 1})
    if not user or not get_settings().resend_api_key:
        return response

    code = f"{secrets.randbelow(1_000_000):06d}"
    # A CAS update prevents simultaneous requests from racing to issue different codes.
    query = {"_id": email}
    if record:
        query["lastSentAt"] = record.get("lastSentAt")
    else:
        query["lastSentAt"] = {"$exists": False}
    new_record = {
        "digest": _digest(email, code),
        "expiresAt": now + CODE_LIFETIME,
        "lastSentAt": now,
        "attempts": 0,
    }
    try:
        updated = await collection.update_one(query, {"$set": new_record}, upsert=record is None)
    except DuplicateKeyError:
        return response
    if not (updated.modified_count or updated.upserted_id is not None):
        return response

    delivered = await send_login_code_email(to_email=email, code=code)
    if not delivered:
        # Avoid removing a newer request if one somehow replaced this code.
        await collection.delete_one({"_id": email, "digest": new_record["digest"]})
    return response


@router.post("/verify")
async def verify_email_code(
    payload: VerifyEmailCode,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    email = str(payload.email).strip().lower()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    collection = get_db().email_login_codes
    record = await collection.find_one_and_update(
        {"_id": email, "expiresAt": {"$gt": now}, "attempts": {"$lt": MAX_ATTEMPTS}},
        {"$inc": {"attempts": 1}},
        return_document=ReturnDocument.AFTER,
    )
    generic_error = "Invalid or expired code. Request a new code and try again."
    if not record:
        raise AppError(generic_error, 401)
    if not hmac.compare_digest(record["digest"], _digest(email, payload.code)):
        raise AppError(generic_error, 401)
    # Single-use, also safe when multiple matching requests arrive together.
    result = await collection.delete_one({"_id": email, "digest": record["digest"], "attempts": record["attempts"]})
    if result.deleted_count != 1:
        raise AppError(generic_error, 401)

    user = await auth_service.users.find_by_email(email)
    if not user or user.get("isActive") is False or user.get("isBlocked") is True:
        raise AppError("Account unavailable", 403)
    if user.get("verificationStatus") in ("pending", "rejected", "suspended"):
        raise AppError("Membership is not approved for access", 403)
    tokens = await auth_service._issue_tokens(user)
    return {"user": serialize_user(user).model_dump(by_alias=True), **tokens.model_dump(by_alias=True)}
