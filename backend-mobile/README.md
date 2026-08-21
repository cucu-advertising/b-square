# BSquare Mobile API (Python + MongoDB)

Separate backend for the Flutter mobile app. Runs on **port 5001** and does not touch the existing Node/PostgreSQL backend.

## Setup

```bash
cd backend-mobile
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env           # or use the existing .env
python run.py
```

Requires MongoDB running locally (default: `mongodb://127.0.0.1:27017/bsquare_mobile`).

## MongoDB User Schema (matches mobile `SignupData`)

All fields use **camelCase** exactly as in the Flutter app:

| Step | Fields |
|------|--------|
| 1 — Name | `firstName`, `lastName` |
| 2 — Account | `email`, `passwordHash` |
| 3 — Images | `profilePhoto`, `companyLogo` |
| 3b — Gallery | `businessGallery` (max 4) |
| 4 — Verification | `verificationType`, `dinNumber`, `dinDirectorName`, `linkedinUrl`, `successionPrevDin`, `successionNewDin`, `successionDocNote` |
| 5 — Business | `businessName`, `industry`, `city`, `bio` |
| 6 — About you | `founderName`, `companyName`, `role`, `headline`, `yearFounded`, `companySize`, `revenueRange` |
| 7 — Goals | `businessGoal` |
| 8 — Connect | `lookingFor` |
| 9 — Interests | `businessInterests` |
| Location | `latitude`, `longitude`, `locationEnabled` |
| Meta | `createdAt`, `updatedAt` |

## Register payload

```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "businessName": "Acme Traders",
  "industry": "Manufacturing",
  "city": "Hyderabad",
  "bio": "B2B supplier",
  "verificationType": "din",
  "dinNumber": "00123456",
  "dinDirectorName": "Rahul Sharma",
  "latitude": 17.385,
  "longitude": 78.4867
}
```

Also accepts `lat` / `lng` (from current Flutter payload) and stores as `latitude` / `longitude`.

## Onboarding payload

```json
{
  "founderName": "Rahul Sharma",
  "companyName": "Acme Traders",
  "role": "Founder & CEO",
  "yearFounded": "2018",
  "companySize": "11–50",
  "revenueRange": "₹5Cr - ₹25Cr",
  "businessGoal": "clients",
  "lookingFor": ["Manufacturers", "Investors"],
  "businessInterests": ["B2B Sales", "Import/Export"]
}
```
