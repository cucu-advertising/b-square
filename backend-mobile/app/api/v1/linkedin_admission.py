"""Secure LinkedIn OIDC handoff for a founder-only Bsquare membership application.

LinkedIn's basic OpenID Connect profile proves account authentication, not
founder/CEO/employment status. New applicants remain pending independent review.
"""
from datetime import datetime, timedelta, timezone
import secrets
from typing import Annotated
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import DuplicateKeyError

from app.api.deps import get_auth_service
from app.api.v1.signup_email import digest
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.db.connection import get_db
from app.models.user import new_user_document
from app.services import linkedin_oauth
from app.services.admission import is_eligible_role
from app.services.auth_service import AuthService, serialize_user

router = APIRouter(prefix="/auth/linkedin", tags=["auth"])
_STATE_TTL = timedelta(minutes=10)
_TICKET_TTL = timedelta(minutes=15)


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _key(kind: str, token: str) -> str:
    return digest("", kind, token)


class CompleteLinkedIn(BaseModel):
    ticket: str = Field(min_length=24, max_length=300)


class ApplyLinkedIn(BaseModel):
    ticket: str = Field(min_length=24, max_length=300)
    business_name: str = Field(alias="businessName", min_length=2, max_length=120)
    role_title: str = Field(alias="roleTitle", min_length=2, max_length=150)
    city: str = Field(min_length=2, max_length=120)
    industry: str = Field(default="", max_length=100)
    linkedin_url: str = Field(default="", alias="linkedinUrl", max_length=300)
    model_config = {"populate_by_name": True}


@router.get("/start")
async def linkedin_start(platform: str = Query(default="app", pattern="^(app|web)$")) -> dict:
    settings = get_settings()
    if not settings.linkedin_client_id or not settings.linkedin_client_secret or not settings.linkedin_redirect_uri:
        raise AppError("LinkedIn sign-in has not been configured", 503)
    if platform == "web" and not settings.linkedin_web_redirect_uri:
        raise AppError("LinkedIn browser callback has not been configured", 503)
    state = secrets.token_urlsafe(32)
    await get_db().linkedin_oauth_states.insert_one({
        "_id": _key("linkedin-state", state),
        "platform": platform,
        "expiresAt": _now() + _STATE_TTL,
    })
    return {"url": linkedin_oauth.build_authorization_url(state)}


@router.get("/callback-v2")
async def linkedin_callback_v2(code: str = "", state: str = "", error: str = "") -> RedirectResponse:
    settings = get_settings()
    if not state:
        raise AppError("LinkedIn session expired", 401)
    record = await get_db().linkedin_oauth_states.find_one_and_delete({
        "_id": _key("linkedin-state", state),
        "expiresAt": {"$gt": _now()},
    })
    if record is None:
        raise AppError("LinkedIn session expired or already used", 401)
    platform = record["platform"]
    destination = (
        settings.linkedin_web_redirect_uri if platform == "web"
        else f"{settings.linkedin_app_redirect_scheme}://linkedin-callback"
    )
    if not destination:
        raise AppError("Redirect URL not configured", 503)
    if error or not code:
        return RedirectResponse(destination + "?" + urlencode({"error": "LinkedIn authorization cancelled"}), status_code=302)
    try:
        claims = await linkedin_oauth.exchange_code_for_claims(code)
        # OIDC alone does not attest a founder title or even always supply email.
        if claims.get("email_verified") is not True or not claims.get("email") or not claims.get("sub"):
            raise AppError("LinkedIn did not confirm an email. Please use verified work email instead.", 403)
    except AppError as exc:
        return RedirectResponse(destination + "?" + urlencode({"error": exc.message}), status_code=302)
    ticket = secrets.token_urlsafe(32)
    await get_db().linkedin_admission_tickets.insert_one({
        "_id": _key("linkedin-ticket", ticket),
        "sub": str(claims["sub"]),
        "email": str(claims["email"]).strip().lower(),
        "name": str(claims.get("name") or "Member")[:150],
        "picture": str(claims.get("picture") or "")[:2000],
        "expiresAt": _now() + _TICKET_TTL,
    })
    return RedirectResponse(destination + "?" + urlencode({"ticket": ticket}), status_code=302)


@router.post("/complete")
async def linkedin_complete(
    payload: CompleteLinkedIn,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    record = await get_db().linkedin_admission_tickets.find_one({
        "_id": _key("linkedin-ticket", payload.ticket),
        "expiresAt": {"$gt": _now()},
    })
    if not record:
        raise AppError("LinkedIn verification has expired. Please try again.", 401)
    user = await auth_service.users.find_by_linkedin_sub(record["sub"])
    if user:
        # No JWTs issued to pending/rejected members.
        tokens = await auth_service._issue_tokens(user)
        await get_db().linkedin_admission_tickets.delete_one({"_id": record["_id"]})
        return {"status": "approved", "user": serialize_user(user).model_dump(by_alias=True), **tokens.model_dump(by_alias=True)}
    if await auth_service.users.find_by_email(record["email"]):
        raise AppError("This email has an existing Bsquare account. Sign in with email to avoid duplicate accounts.", 409)
    return {
        "status": "profile_required",
        "ticket": payload.ticket,
        "name": record["name"],
        "email": record["email"],
        "picture": record["picture"],
        "message": "LinkedIn identity connected. Founder eligibility still needs review.",
    }


@router.post("/apply")
async def linkedin_apply(
    payload: ApplyLinkedIn,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    if not is_eligible_role(payload.role_title):
        raise AppError("Only founders and business owners can apply", 422)
    if not payload.business_name.strip() or not payload.city.strip():
        raise AppError("Business name and city are required", 422)
    record = await get_db().linkedin_admission_tickets.find_one_and_delete({
        "_id": _key("linkedin-ticket", payload.ticket),
        "expiresAt": {"$gt": _now()},
    })
    if not record:
        raise AppError("LinkedIn session expired. Please verify again.", 401)
    email = record["email"]
    if await auth_service.users.find_by_email(email) or await auth_service.users.find_by_linkedin_sub(record["sub"]):
        raise AppError("This account already exists. Please sign in instead.", 409)
    parts = record["name"].split(None, 1)
    user = new_user_document(
        firstName=parts[0] if parts else "Member",
        lastName=parts[1] if len(parts) > 1 else "",
        email=email,
        oauthLinkedinSub=record["sub"],
        profilePhoto=record["picture"] or None,
        verificationType="linkedin",
        emailVerifiedAt=_now(),
        businessName=payload.business_name.strip(),
        companyName=payload.business_name.strip(),
        city=payload.city.strip(),
        industry=payload.industry.strip(),
        role=payload.role_title.strip(),
        roleTitle=payload.role_title.strip(),
        founderName=record["name"],
        linkedinUrl=payload.linkedin_url.strip() or None,
        membershipStatus="pending",
        verificationStatus="pending",
    )
    try:
        await auth_service.users.create(user)
    except DuplicateKeyError as exc:
        raise AppError("Account already exists", 409) from exc
    return {"status": "pending", "message": "LinkedIn sign-in completed. Membership awaits founder review."}
