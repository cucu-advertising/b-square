"""Private, audited membership decisions for verified founders.

Requires an authenticated legacy/approved admin whose email is configured in
BSQUARE_ADMIN_EMAILS. Never approve from a self-declared title or mailbox OTP alone.
"""
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.deps import get_current_user_id
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.db.connection import get_db

router = APIRouter(prefix="/admin/admission", tags=["admin"])


class Decision(BaseModel):
    evidence_note: str = Field(alias="evidenceNote", min_length=15, max_length=1000)
    model_config = {"populate_by_name": True}


async def _admin_id(user_id: str) -> str:
    settings = get_settings()
    allowed = {e.strip().lower() for e in settings.bsquare_admin_emails.split(",") if e.strip()}
    if not allowed:
        raise AppError("Review admin access is not configured", 503)
    user = await get_db().users.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("email", "").strip().lower() not in allowed:
        raise AppError("Admin access required", 403)
    return user_id


@router.get("/pending")
async def pending_members(user_id: Annotated[str, Depends(get_current_user_id)]) -> dict:
    await _admin_id(user_id)
    cursor = get_db().users.find(
        {"membershipStatus": "pending"},
        {"firstName": 1, "lastName": 1, "email": 1, "businessName": 1,
         "roleTitle": 1, "verificationType": 1, "linkedinUrl": 1,
         "emailVerifiedAt": 1, "createdAt": 1},
    ).sort("createdAt", -1).limit(100)
    items = await cursor.to_list(length=100)
    return {"applications": [{**{k: v for k, v in item.items() if k != "_id"}, "id": str(item["_id"])} for item in items]}


@router.post("/{member_id}/approve")
async def approve_member(member_id: str, payload: Decision, user_id: Annotated[str, Depends(get_current_user_id)]) -> dict:
    await _admin_id(user_id)
    if not ObjectId.is_valid(member_id):
        raise AppError("Invalid member ID", 422)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = await get_db().users.update_one(
        {"_id": ObjectId(member_id), "membershipStatus": "pending",
         "roleTitle": {"$exists": True}, "emailVerifiedAt": {"$exists": True}},
        {"$set": {"membershipStatus": "approved", "verificationStatus": "approved",
                  "admissionReviewedAt": now, "admissionReviewedBy": user_id,
                  "admissionReviewEvidence": payload.evidence_note.strip()}},
    )
    if result.modified_count != 1:
        raise AppError("Application unavailable or already reviewed", 409)
    return {"status": "approved"}


@router.post("/{member_id}/reject")
async def reject_member(member_id: str, payload: Decision, user_id: Annotated[str, Depends(get_current_user_id)]) -> dict:
    await _admin_id(user_id)
    if not ObjectId.is_valid(member_id):
        raise AppError("Invalid member ID", 422)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = await get_db().users.update_one(
        {"_id": ObjectId(member_id), "membershipStatus": "pending"},
        {"$set": {"membershipStatus": "rejected", "verificationStatus": "rejected",
                  "admissionReviewedAt": now, "admissionReviewedBy": user_id,
                  "admissionReviewEvidence": payload.evidence_note.strip()}},
    )
    if result.modified_count != 1:
        raise AppError("Application unavailable or already reviewed", 409)
    return {"status": "rejected"}
