from datetime import datetime
from typing import Any, Literal

VerificationType = Literal["din", "linkedin", "succession"]


def new_user_document(**fields: Any) -> dict[str, Any]:
    """MongoDB document fields mirror mobile SignupData exactly (camelCase)."""
    now = datetime.utcnow()
    base: dict[str, Any] = {
        # Step 1 — Name
        "firstName": "",
        "lastName": "",
        # Step 2 — Account
        "email": "",
        "passwordHash": "",
        # Step 3 — Profile images
        "profilePhoto": None,
        "companyLogo": None,
        # Step 3b — Gallery
        "businessGallery": [],
        # Step 4 — Verification
        "verificationType": "din",
        "dinNumber": None,
        "dinDirectorName": None,
        "linkedinUrl": None,
        "successionPrevDin": None,
        "successionNewDin": None,
        "successionDocNote": None,
        # Step 5 — Business info
        "businessName": "",
        "industry": "",
        "city": "",
        "bio": "",
        # Step 6 — About you
        "founderName": "",
        "companyName": "",
        "role": "",
        "headline": "I'm a Member of BSquare",
        "yearFounded": "",
        "companySize": "",
        "revenueRange": "",
        # Step 7 — Business goals
        "businessGoal": "",
        # Step 8 — Connect with
        "lookingFor": [],
        # Step 9 — Interests
        "businessInterests": [],
        # Location
        "latitude": None,
        "longitude": None,
        "locationEnabled": False,
        # Meta
        "createdAt": now,
        "updatedAt": now,
    }
    base.update(fields)
    return base
