"""Firebase Phone OTP account linking and sign-in for the existing MongoDB backend.

A verified phone number is NOT sufficient to take over an existing account.
Members first link Firebase to an authenticated B Square session.
"""
import re
from datetime import datetime
from typing import Annotated

import firebase_admin
from firebase_admin import auth as firebase_auth
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from pymongo.errors import DuplicateKeyError

from app.api.deps import get_auth_service, get_current_user_id
from app.core.exceptions import AppError
from app.services.auth_service import AuthService, serialize_user

router = APIRouter(prefix="/firebase-phone", tags=["firebase-phone"])
PHONE_PATTERN = re.compile(r"^\+91[6-9]\d{9}$")


class FirebaseTokenRequest(BaseModel):
    id_token: str = Field(alias="idToken", min_length=100, max_length=12000)


def _verify_firebase_id_token(token: str) -> dict:
    # GOOGLE_APPLICATION_CREDENTIALS must point to a private Render secret file.
    # No service account secret belongs in the mobile app or GitHub.
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    return firebase_auth.verify_id_token(token, check_revoked=True)


async def _verified_phone(payload: FirebaseTokenRequest) -> tuple[str, str]:
    try:
        claims = await run_in_threadpool(_verify_firebase_id_token, payload.id_token)
    except Exception as exc:
        raise AppError("Firebase phone verification failed", 401) from exc

    import time
    age = time.time() - float(claims.get("auth_time") or 0)
    phone = claims.get("phone_number")
    if (
        claims.get("firebase", {}).get("sign_in_provider") != "phone"
        or not isinstance(phone, str)
        or not PHONE_PATTERN.fullmatch(phone)
        or not (-60 <= age <= 300)
        or not isinstance(claims.get("uid"), str)
        or not claims["uid"]
    ):
        raise AppError("Fresh verified Indian phone authentication is required", 401)
    return claims["uid"], phone


@router.post("/link")
async def link_phone(
    payload: FirebaseTokenRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    """Require BOTH a valid B Square session and freshly verified Firebase phone."""
    uid, phone = await _verified_phone(payload)
    users = auth_service.users
    user = await users.find_by_id(user_id)
    if not user:
        raise AppError("Account not found", 404)
    existing = await users.collection.find_one({"firebasePhoneUid": uid})
    if existing and str(existing["_id"]) != user_id:
        raise AppError("This verified phone is linked to another account", 409)
    existing_phone = await users.collection.find_one({"verifiedPhoneE164": phone})
    if existing_phone and str(existing_phone["_id"]) != user_id:
        raise AppError("This verified phone is linked to another account", 409)
    if user.get("firebasePhoneUid") and user["firebasePhoneUid"] != uid:
        raise AppError("Contact support to change your linked phone", 409)
    try:
        await users.update(user_id, {
            "firebasePhoneUid": uid,
            "verifiedPhoneE164": phone,
            "phoneVerifiedAt": datetime.utcnow(),
        })
    except DuplicateKeyError as exc:
        raise AppError("This verified phone is linked to another account", 409) from exc
    return {"linked": True}


@router.post("/session")
async def phone_session(
    payload: FirebaseTokenRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    uid, phone = await _verified_phone(payload)
    user = await auth_service.users.collection.find_one({
        "firebasePhoneUid": uid,
        "verifiedPhoneE164": phone,
    })
    if not user:
        raise AppError("Phone not linked. Sign in with your existing account and link it first.", 403)
    if user.get("isActive") is False or user.get("isBlocked") is True:
        raise AppError("Account is unavailable", 403)
    # Preserve an existing explicit approval decision where a migration has it.
    if user.get("verificationStatus") in ("pending", "rejected", "suspended"):
        raise AppError("Membership is not approved for access", 403)
    tokens = await auth_service._issue_tokens(user)
    return {"user": serialize_user(user).model_dump(by_alias=True),
            **tokens.model_dump(by_alias=True)}
