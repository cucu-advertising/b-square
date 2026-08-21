import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.core.constants import (
    BUSINESS_GOALS,
    BUSINESS_INTERESTS,
    CITIES,
    COMPANY_SIZES,
    CONNECT_WITH_OPTIONS,
    INDUSTRIES,
    REVENUE_RANGES,
    VERIFICATION_TYPES,
)


class RegisterRequest(BaseModel):
    first_name: str = Field(default="", alias="firstName")
    last_name: str = Field(default="", alias="lastName")
    name: str | None = None
    email: EmailStr
    password: str = Field(min_length=8)
    business_name: str = Field(alias="businessName")
    industry: str = ""
    city: str
    bio: str = ""
    verification_type: Literal["din", "linkedin", "succession"] = Field(alias="verificationType")
    din_number: str | None = Field(default=None, alias="dinNumber")
    din_director_name: str | None = Field(default=None, alias="dinDirectorName")
    linkedin_url: str | None = Field(default=None, alias="linkedinUrl")
    succession_prev_din: str | None = Field(default=None, alias="successionPrevDin")
    succession_new_din: str | None = Field(default=None, alias="successionNewDin")
    succession_doc_note: str | None = Field(default=None, alias="successionDocNote")
    latitude: float | None = Field(default=None, alias="latitude")
    longitude: float | None = Field(default=None, alias="longitude")
    lat: float | None = None
    lng: float | None = None
    location_enabled: bool = Field(default=False, alias="locationEnabled")

    model_config = {"populate_by_name": True}

    @field_validator("industry")
    @classmethod
    def validate_industry(cls, value: str) -> str:
        if value and value not in INDUSTRIES:
            raise ValueError("Invalid industry")
        return value

    @field_validator("verification_type")
    @classmethod
    def validate_verification_type(cls, value: str) -> str:
        if value not in VERIFICATION_TYPES:
            raise ValueError("Invalid verification type")
        return value

    @model_validator(mode="after")
    def validate_verification_fields(self) -> "RegisterRequest":
        if self.verification_type == "din":
            if not self.din_number or not self.din_number.strip():
                raise ValueError("DIN number is required")
            if not re.fullmatch(r"\d{8}", self.din_number.strip()):
                raise ValueError("DIN must be exactly 8 digits")
            if not self.din_director_name or not self.din_director_name.strip():
                raise ValueError("Director name is required")
        elif self.verification_type == "linkedin":
            if not self.linkedin_url or "linkedin.com/in/" not in self.linkedin_url.lower():
                raise ValueError("Must be a valid LinkedIn profile URL")
        elif self.verification_type == "succession":
            if not self.succession_doc_note or not self.succession_doc_note.strip():
                raise ValueError("Succession details are required")
            if self.succession_new_din and not re.fullmatch(r"\d{8}", self.succession_new_din.strip()):
                raise ValueError("New DIN must be 8 digits if provided")
        return self

    def resolved_first_name(self) -> str:
        if self.first_name.strip():
            return self.first_name.strip()
        if self.name:
            return self.name.strip().split(None, 1)[0]
        return ""

    def resolved_last_name(self) -> str:
        if self.last_name.strip():
            return self.last_name.strip()
        if self.name:
            parts = self.name.strip().split(None, 1)
            return parts[1] if len(parts) > 1 else ""
        return ""

    def resolved_latitude(self) -> float | None:
        return self.latitude if self.latitude is not None else self.lat

    def resolved_longitude(self) -> float | None:
        return self.longitude if self.longitude is not None else self.lng


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str = Field(alias="refreshToken")

    model_config = {"populate_by_name": True}


class OnboardingRequest(BaseModel):
    founder_name: str = Field(default="", alias="founderName")
    company_name: str = Field(default="", alias="companyName")
    role: str = ""
    headline: str = "I'm a Member of BSquare"
    year_founded: str = Field(default="", alias="yearFounded")
    company_size: str = Field(default="", alias="companySize")
    revenue_range: str = Field(default="", alias="revenueRange")
    business_goal: str = Field(default="", alias="businessGoal")
    looking_for: list[str] = Field(default_factory=list, alias="lookingFor")
    business_interests: list[str] = Field(default_factory=list, alias="businessInterests")
    profile_photo: str | None = Field(default=None, alias="profilePhoto")
    company_logo: str | None = Field(default=None, alias="companyLogo")
    business_gallery: list[str] = Field(default_factory=list, alias="businessGallery")
    latitude: float | None = Field(default=None, alias="latitude")
    longitude: float | None = Field(default=None, alias="longitude")
    location_enabled: bool | None = Field(default=None, alias="locationEnabled")

    model_config = {"populate_by_name": True}

    @field_validator("company_size")
    @classmethod
    def validate_company_size(cls, value: str) -> str:
        if value and value not in COMPANY_SIZES:
            raise ValueError("Invalid company size")
        return value

    @field_validator("revenue_range")
    @classmethod
    def validate_revenue_range(cls, value: str) -> str:
        if value and value not in REVENUE_RANGES:
            raise ValueError("Invalid revenue range")
        return value

    @field_validator("business_goal")
    @classmethod
    def validate_business_goal(cls, value: str) -> str:
        if value and value not in BUSINESS_GOALS:
            raise ValueError("Invalid business goal")
        return value

    @field_validator("looking_for")
    @classmethod
    def validate_looking_for(cls, value: list[str]) -> list[str]:
        invalid = [item for item in value if item not in CONNECT_WITH_OPTIONS]
        if invalid:
            raise ValueError(f"Invalid connect-with options: {', '.join(invalid)}")
        return value

    @field_validator("business_interests")
    @classmethod
    def validate_business_interests(cls, value: list[str]) -> list[str]:
        invalid = [item for item in value if item not in BUSINESS_INTERESTS]
        if invalid:
            raise ValueError(f"Invalid business interests: {', '.join(invalid)}")
        return value

    @field_validator("business_gallery")
    @classmethod
    def validate_gallery(cls, value: list[str]) -> list[str]:
        if len(value) > 4:
            raise ValueError("Business gallery supports up to 4 photos")
        return value


class ProfileUpdateRequest(BaseModel):
    first_name: str = Field(default="", alias="firstName")
    last_name: str = Field(default="", alias="lastName")
    founder_name: str = Field(default="", alias="founderName")
    city: str = ""
    industry: str = ""
    bio: str = ""
    headline: str = "I'm a Member of BSquare"
    business_name: str = Field(default="", alias="businessName")
    company_name: str = Field(default="", alias="companyName")
    role: str = ""
    year_founded: str = Field(default="", alias="yearFounded")
    company_size: str = Field(default="", alias="companySize")
    revenue_range: str = Field(default="", alias="revenueRange")
    business_goal: str = Field(default="", alias="businessGoal")
    looking_for: list[str] = Field(default_factory=list, alias="lookingFor")
    business_interests: list[str] = Field(default_factory=list, alias="businessInterests")
    linkedin_url: str = Field(default="", alias="linkedinUrl")

    model_config = {"populate_by_name": True}

    @field_validator("city")
    @classmethod
    def validate_city(cls, value: str) -> str:
        if value and value not in CITIES:
            raise ValueError("Invalid city")
        return value

    @field_validator("industry")
    @classmethod
    def validate_industry(cls, value: str) -> str:
        if value and value not in INDUSTRIES:
            raise ValueError("Invalid industry")
        return value

    @field_validator("company_size")
    @classmethod
    def validate_company_size(cls, value: str) -> str:
        if value and value not in COMPANY_SIZES:
            raise ValueError("Invalid company size")
        return value

    @field_validator("revenue_range")
    @classmethod
    def validate_revenue_range(cls, value: str) -> str:
        if value and value not in REVENUE_RANGES:
            raise ValueError("Invalid revenue range")
        return value

    @field_validator("business_goal")
    @classmethod
    def validate_business_goal(cls, value: str) -> str:
        if value and value not in BUSINESS_GOALS:
            raise ValueError("Invalid business goal")
        return value

    @field_validator("looking_for")
    @classmethod
    def validate_looking_for(cls, value: list[str]) -> list[str]:
        invalid = [item for item in value if item not in CONNECT_WITH_OPTIONS]
        if invalid:
            raise ValueError(f"Invalid connect-with options: {', '.join(invalid)}")
        return value

    @field_validator("business_interests")
    @classmethod
    def validate_business_interests(cls, value: list[str]) -> list[str]:
        if len(value) > 5:
            raise ValueError("Select up to 5 business interests")
        invalid = [item for item in value if item not in BUSINESS_INTERESTS]
        if invalid:
            raise ValueError(f"Invalid business interests: {', '.join(invalid)}")
        return value


class TokenResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    refresh_token: str = Field(alias="refreshToken")
    token_type: str = Field(default="bearer", alias="tokenType")

    model_config = {"populate_by_name": True}


class UserResponse(BaseModel):
    id: str
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    email: EmailStr
    profile_photo: str | None = Field(default=None, alias="profilePhoto")
    company_logo: str | None = Field(default=None, alias="companyLogo")
    business_gallery: list[str] = Field(default_factory=list, alias="businessGallery")
    verification_type: str = Field(alias="verificationType")
    din_number: str | None = Field(default=None, alias="dinNumber")
    din_director_name: str | None = Field(default=None, alias="dinDirectorName")
    linkedin_url: str | None = Field(default=None, alias="linkedinUrl")
    succession_prev_din: str | None = Field(default=None, alias="successionPrevDin")
    succession_new_din: str | None = Field(default=None, alias="successionNewDin")
    succession_doc_note: str | None = Field(default=None, alias="successionDocNote")
    business_name: str = Field(alias="businessName")
    industry: str
    city: str
    bio: str = ""
    founder_name: str = Field(alias="founderName")
    company_name: str = Field(alias="companyName")
    role: str
    headline: str
    year_founded: str = Field(alias="yearFounded")
    company_size: str = Field(alias="companySize")
    revenue_range: str = Field(alias="revenueRange")
    business_goal: str = Field(alias="businessGoal")
    looking_for: list[str] = Field(default_factory=list, alias="lookingFor")
    business_interests: list[str] = Field(default_factory=list, alias="businessInterests")
    latitude: float | None = None
    longitude: float | None = None
    location_enabled: bool = Field(default=False, alias="locationEnabled")

    model_config = {"populate_by_name": True}
