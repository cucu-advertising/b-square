from typing import Any

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import AppError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import new_user_document
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    LoginRequest,
    OnboardingRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)


def _user_id(user: dict[str, Any]) -> str:
    return str(user["_id"])


def serialize_user(user: dict[str, Any]) -> UserResponse:
    return UserResponse(
        id=_user_id(user),
        firstName=user.get("firstName", ""),
        lastName=user.get("lastName", ""),
        email=user["email"],
        profilePhoto=user.get("profilePhoto"),
        companyLogo=user.get("companyLogo"),
        businessGallery=user.get("businessGallery", []),
        verificationType=user.get("verificationType", "din"),
        dinNumber=user.get("dinNumber"),
        dinDirectorName=user.get("dinDirectorName"),
        linkedinUrl=user.get("linkedinUrl"),
        successionPrevDin=user.get("successionPrevDin"),
        successionNewDin=user.get("successionNewDin"),
        successionDocNote=user.get("successionDocNote"),
        businessName=user.get("businessName", ""),
        industry=user.get("industry", ""),
        city=user.get("city", ""),
        bio=user.get("bio", ""),
        founderName=user.get("founderName", ""),
        companyName=user.get("companyName", ""),
        role=user.get("role", ""),
        headline=user.get("headline", ""),
        yearFounded=user.get("yearFounded", ""),
        companySize=user.get("companySize", ""),
        revenueRange=user.get("revenueRange", ""),
        businessGoal=user.get("businessGoal", ""),
        lookingFor=user.get("lookingFor", []),
        businessInterests=user.get("businessInterests", []),
        latitude=user.get("latitude"),
        longitude=user.get("longitude"),
        locationEnabled=user.get("locationEnabled", False),
    )


class AuthService:
    def __init__(self, users: UserRepository, refresh_tokens: RefreshTokenRepository):
        self.users = users
        self.refresh_tokens = refresh_tokens

    async def _issue_tokens(self, user: dict[str, Any]) -> TokenResponse:
        user_id = _user_id(user)
        access_token = create_access_token(user_id)
        refresh_token, expires_at = create_refresh_token(user_id)
        await self.refresh_tokens.save(user_id, refresh_token, expires_at.replace(tzinfo=None))
        return TokenResponse(accessToken=access_token, refreshToken=refresh_token)

    async def register(self, payload: RegisterRequest) -> tuple[UserResponse, TokenResponse]:
        email = payload.email.lower()
        existing = await self.users.find_by_email(email)
        if existing:
            raise AppError("An account with this email already exists", 409)

        if payload.verification_type == "din" and payload.din_number:
            din_existing = await self.users.find_by_din(payload.din_number.strip())
            if din_existing:
                raise AppError("This DIN is already registered", 409)

        first_name = payload.resolved_first_name()
        last_name = payload.resolved_last_name()
        if not first_name:
            raise AppError("First name is required", 400)

        document = new_user_document(
            firstName=first_name,
            lastName=last_name,
            email=email,
            passwordHash=hash_password(payload.password),
            businessName=payload.business_name.strip(),
            industry=payload.industry,
            city=payload.city,
            bio=payload.bio.strip(),
            verificationType=payload.verification_type,
            dinNumber=payload.din_number.strip() if payload.verification_type == "din" else None,
            dinDirectorName=payload.din_director_name.strip()
            if payload.verification_type == "din"
            else None,
            linkedinUrl=payload.linkedin_url.strip() if payload.verification_type == "linkedin" else None,
            successionPrevDin=payload.succession_prev_din.strip() if payload.succession_prev_din else None,
            successionNewDin=payload.succession_new_din.strip() if payload.succession_new_din else None,
            successionDocNote=payload.succession_doc_note.strip()
            if payload.verification_type == "succession"
            else None,
            latitude=payload.resolved_latitude(),
            longitude=payload.resolved_longitude(),
            locationEnabled=payload.location_enabled,
            founderName=f"{first_name} {last_name}".strip(),
            companyName=payload.business_name.strip(),
        )

        try:
            user = await self.users.create(document)
        except DuplicateKeyError as exc:
            key_pattern = (exc.details or {}).get("keyPattern") or {}
            if "dinNumber" in key_pattern:
                raise AppError("This DIN is already registered", 409) from exc
            raise AppError("An account with this email already exists", 409) from exc

        tokens = await self._issue_tokens(user)
        return serialize_user(user), tokens

    async def login(self, payload: LoginRequest) -> tuple[UserResponse, TokenResponse]:
        user = await self.users.find_by_email(payload.email.lower())
        if not user:
            raise AppError("This email doesn't exist", 401)
        if not verify_password(payload.password, user["passwordHash"]):
            raise AppError("The password is incorrect", 401)

        tokens = await self._issue_tokens(user)
        return serialize_user(user), tokens

    async def refresh(self, refresh_token: str) -> TokenResponse:
        stored = await self.refresh_tokens.find_valid(refresh_token)
        if not stored:
            raise AppError("Invalid or expired refresh token", 401)

        user = await self.users.find_by_id(stored["user_id"])
        if not user:
            raise AppError("User not found", 404)

        await self.refresh_tokens.delete(refresh_token)
        return await self._issue_tokens(user)

    async def logout(self, refresh_token: str) -> None:
        await self.refresh_tokens.delete(refresh_token)

    async def get_me(self, user_id: str) -> UserResponse:
        user = await self.users.find_by_id(user_id)
        if not user:
            raise AppError("User not found", 404)
        return serialize_user(user)

    async def get_public_profile(self, user_id: str) -> UserResponse:
        user = await self.users.find_by_id(user_id)
        if not user:
            raise AppError("User not found", 404)
        return serialize_user(user)

    async def discover_users(self, user_id: str) -> list[UserResponse]:
        users = await self.users.list_discoverable(user_id)
        return [serialize_user(user) for user in users]

    async def complete_onboarding(self, user_id: str, payload: OnboardingRequest) -> UserResponse:
        user = await self.users.find_by_id(user_id)
        if not user:
            raise AppError("User not found", 404)

        updates: dict[str, Any] = {
            "founderName": payload.founder_name.strip(),
            "companyName": payload.company_name.strip(),
            "role": payload.role.strip(),
            "headline": payload.headline.strip(),
            "yearFounded": payload.year_founded,
            "companySize": payload.company_size,
            "revenueRange": payload.revenue_range,
            "businessGoal": payload.business_goal,
            "lookingFor": payload.looking_for,
            "businessInterests": payload.business_interests,
        }

        if payload.profile_photo:
            updates["profilePhoto"] = payload.profile_photo
        if payload.company_logo:
            updates["companyLogo"] = payload.company_logo
        if payload.business_gallery:
            updates["businessGallery"] = payload.business_gallery
        if payload.latitude is not None:
            updates["latitude"] = payload.latitude
        if payload.longitude is not None:
            updates["longitude"] = payload.longitude
        if payload.location_enabled is not None:
            updates["locationEnabled"] = payload.location_enabled

        updated = await self.users.update(user_id, updates)
        return serialize_user(updated or user)

    async def update_profile(self, user_id: str, payload: ProfileUpdateRequest) -> UserResponse:
        user = await self.users.find_by_id(user_id)
        if not user:
            raise AppError("User not found", 404)

        founder = payload.founder_name.strip()
        first = payload.first_name.strip()
        last = payload.last_name.strip()
        if not founder and (first or last):
            founder = f"{first} {last}".strip()
        if founder and not first and not last:
            parts = founder.split(None, 1)
            first = parts[0] if parts else ""
            last = parts[1] if len(parts) > 1 else ""

        company = payload.company_name.strip() or payload.business_name.strip()
        business = payload.business_name.strip() or company

        updates: dict[str, Any] = {
            "firstName": first,
            "lastName": last,
            "founderName": founder,
            "city": payload.city,
            "industry": payload.industry,
            "bio": payload.bio.strip(),
            "headline": payload.headline.strip() or "I'm a Member of BSquare",
            "businessName": business,
            "companyName": company,
            "role": payload.role.strip(),
            "yearFounded": payload.year_founded,
            "companySize": payload.company_size,
            "revenueRange": payload.revenue_range,
            "businessGoal": payload.business_goal,
            "lookingFor": payload.looking_for,
            "businessInterests": payload.business_interests,
            "linkedinUrl": payload.linkedin_url.strip() or None,
        }

        updated = await self.users.update(user_id, updates)
        return serialize_user(updated or user)

    async def update_images(
        self,
        user_id: str,
        *,
        profile_photo: str | None = None,
        company_logo: str | None = None,
        business_gallery: list[str] | None = None,
    ) -> UserResponse:
        user = await self.users.find_by_id(user_id)
        if not user:
            raise AppError("User not found", 404)

        updates: dict[str, Any] = {}
        if profile_photo is not None:
            updates["profilePhoto"] = profile_photo
        if company_logo is not None:
            updates["companyLogo"] = company_logo
        if business_gallery is not None:
            if len(business_gallery) > 4:
                raise AppError("Business gallery supports up to 4 photos")
            updates["businessGallery"] = business_gallery

        if not updates:
            return serialize_user(user)

        updated = await self.users.update(user_id, updates)
        return serialize_user(updated or user)
