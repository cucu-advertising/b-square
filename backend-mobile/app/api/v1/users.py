from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import get_auth_service, get_connection_service, get_current_user_id
from app.core.constants import (
    BUSINESS_GOALS,
    BUSINESS_INTERESTS,
    CITIES,
    COMPANY_SIZES,
    CONNECT_WITH_OPTIONS,
    INDUSTRIES,
    REVENUE_RANGES,
)
from app.schemas.auth import OnboardingRequest, ProfileUpdateRequest, UserResponse
from app.services.auth_service import AuthService
from app.services.connection_service import ConnectionService
from app.services.upload_service import save_image

router = APIRouter(prefix="/users", tags=["users"])


def _public_user_dict(user: UserResponse) -> dict[str, Any]:
    data = user.model_dump(by_alias=True)
    data.pop("email", None)
    return data


@router.get("/options")
async def get_signup_options() -> dict:
    return {
        "industries": INDUSTRIES,
        "cities": CITIES,
        "companySizes": COMPANY_SIZES,
        "revenueRanges": REVENUE_RANGES,
        "businessGoals": BUSINESS_GOALS,
        "connectWith": CONNECT_WITH_OPTIONS,
        "businessInterests": BUSINESS_INTERESTS,
    }


@router.get("/discover")
async def discover_users(
    user_id: Annotated[str, Depends(get_current_user_id)],
    connection_service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> list[dict]:
    users = await connection_service.discover_users(user_id)
    return [_public_user_dict(user) for user in users]


@router.post("/discover/{target_user_id}/pass")
async def pass_discover_profile(
    target_user_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    connection_service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await connection_service.pass_profile(user_id, target_user_id)


@router.get("/me/stats")
async def my_profile_stats(
    user_id: Annotated[str, Depends(get_current_user_id)],
    connection_service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await connection_service.profile_stats(user_id)


@router.post("/{target_user_id}/view")
async def record_profile_view(
    target_user_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    connection_service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    return await connection_service.record_profile_view(user_id, target_user_id)


@router.get("/{target_user_id}")
async def get_user_profile(
    target_user_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    connection_service: Annotated[ConnectionService, Depends(get_connection_service)],
) -> dict[str, Any]:
    profile = await auth_service.get_public_profile(target_user_id)
    stats = await connection_service.profile_stats(target_user_id)
    await connection_service.record_profile_view(user_id, target_user_id)
    data = _public_user_dict(profile)
    data["stats"] = stats
    return data


@router.patch("/me/onboarding", response_model=UserResponse)
async def complete_onboarding(
    payload: OnboardingRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserResponse:
    return await auth_service.complete_onboarding(user_id, payload)


@router.patch("/me/profile", response_model=UserResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserResponse:
    return await auth_service.update_profile(user_id, payload)


@router.post("/me/images", response_model=UserResponse)
async def upload_images(
    user_id: Annotated[str, Depends(get_current_user_id)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    profilePhoto: UploadFile | None = File(default=None),
    companyLogo: UploadFile | None = File(default=None),
    gallery: list[UploadFile] = File(default=[]),
) -> UserResponse:
    profile_path = await save_image(profilePhoto, "profiles") if profilePhoto else None
    logo_path = await save_image(companyLogo, "logos") if companyLogo else None
    gallery_paths = []
    for item in gallery[:4]:
        gallery_paths.append(await save_image(item, "gallery"))

    return await auth_service.update_images(
        user_id,
        profile_photo=profile_path,
        company_logo=logo_path,
        business_gallery=gallery_paths if gallery_paths else None,
    )
