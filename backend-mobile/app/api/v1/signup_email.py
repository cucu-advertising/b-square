"""Verify ownership of a new applicant's email before allowing registration."""
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr, Field
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.api.v1.email_code import _consume_rate_limit
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.db.connection import get_db
from app.services.email_service import send_signup_code_email

router = APIRouter(prefix="/auth/signup-email", tags=["auth"])
CODE_TTL = timedelta(minutes=5)
VERIFY_TTL = timedelta(minutes=20)
COOLDOWN = timedelta(seconds=60)


class SignupEmailRequest(BaseModel):
    email: EmailStr


class SignupEmailVerify(BaseModel):
    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")


def digest(email: str, purpose: str, value: str) -> str:
    secret = get_settings().jwt_secret.encode("utf-8")
    return hmac.new(secret, f"signup:{purpose}:{email}:{value}".encode(), hashlib.sha256).hexdigest()


@router.post("/request")
async def send_signup_email_code(payload: SignupEmailRequest, request: Request) -> dict[str, str]:
    email = str(payload.email).strip().lower()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    response = {"message": "If this email can be used, a verification code will be sent."}
    ip = request.client.host if request.client else "unknown"
    if not await _consume_rate_limit("signup-ip:" + digest("", "ip", ip), 40, now):
        return response
    if not await _consume_rate_limit("signup-email:" + digest(email, "limit", ""), 5, now):
        return response
    if await get_db().users.find_one({"email": email}, {"_id": 1}):
        return response
    if not get_settings().resend_api_key:
        return response

    collection = get_db().signup_email_codes
    old = await collection.find_one({"_id": email})
    if old and old.get("lastSentAt") and old["lastSentAt"] > now - COOLDOWN:
        return response
    code = f"{secrets.randbelow(1_000_000):06d}"
    query = {"_id": email, "lastSentAt": old.get("lastSentAt") if old else {"$exists": False}}
    record = {
        "digest": digest(email, "code", code),
        "expiresAt": now + CODE_TTL,
        "lastSentAt": now,
        "attempts": 0,
    }
    try:
        updated = await collection.update_one(query, {"$set": record}, upsert=old is None)
    except DuplicateKeyError:
        return response
    if not (updated.modified_count or updated.upserted_id):
        return response
    delivered = await send_signup_code_email(to_email=email, code=code)
    if not delivered:
        await collection.delete_one({"_id": email, "digest": record["digest"]})
    return response


@router.post("/verify")
async def verify_signup_email_code(payload: SignupEmailVerify) -> dict[str, str]:
    email = str(payload.email).strip().lower()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    collection = get_db().signup_email_codes
    record = await collection.find_one_and_update(
        {"_id": email, "expiresAt": {"$gt": now}, "attempts": {"$lt": 5}},
        {"$inc": {"attempts": 1}},
        return_document=ReturnDocument.AFTER,
    )
    generic_error = "Invalid or expired code. Please request a new code."
    if not record or not hmac.compare_digest(record["digest"], digest(email, "code", payload.code)):
        raise AppError(generic_error, 401)
    deleted = await collection.delete_one({"_id": email, "digest": record["digest"], "attempts": record["attempts"]})
    if deleted.deleted_count != 1:
        raise AppError(generic_error, 401)
    if await get_db().users.find_one({"email": email}, {"_id": 1}):
        raise AppError("An account with this email already exists", 409)
    ticket = secrets.token_urlsafe(32)
    await get_db().signup_email_tickets.update_one(
        {"_id": email},
        {"$set": {"digest": digest(email, "ticket", ticket), "expiresAt": now + VERIFY_TTL}},
        upsert=True,
    )
    return {"verificationToken": ticket}
