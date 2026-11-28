# Founder-only admission: release gate

## Applicant paths

**A. Work email:** `/api/v1/auth/signup-email/request` sends a 6-digit code
(5 minutes, limited attempts) to a company mailbox; `/verify` returns a single-use
signup ticket; `/api/v1/auth/register-verified` stores a pending applicant with a
self-declared founder/owner role. Email possession is NOT proof of founder title.

**B. LinkedIn OIDC:** `/api/v1/auth/linkedin/start?platform=app|web`, one-use
OAuth state, LinkedIn callback-v2, server-exchanged OIDC ID token + userinfo,
single-use frontend ticket, `/complete` to resolve an existing approved
user or return a candidate, and `/apply` to submit a pending founder application.

Basic LinkedIn OpenID Connect does not expose reliable founder/employment data.
Partner-only LinkedIn APIs would require product access. Do NOT automatically approve
users from user-supplied founder titles, profile URLs, email domains or OIDC alone.

## Required backend configuration (server only)

- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` from a LinkedIn developer application
  with the **Sign In with LinkedIn using OpenID Connect** product.
- `LINKEDIN_REDIRECT_URI`: exact registered URL
  `https://YOUR-API-HOST/api/v1/auth/linkedin/callback-v2`.
- `LINKEDIN_WEB_REDIRECT_URI`: trusted app callback, e.g.
  `https://YOUR-APP-HOST/linkedin-callback` for browser testing.
- `LINKEDIN_APP_REDIRECT_SCHEME=bsquare` for the Expo native deep link.
- `BSQUARE_ADMIN_EMAILS=admin@yourcompany.com` for previously approved admins.
  Never configure this to a user-supplied mailbox.
- Working MongoDB, JWT secrets, Resend credentials and HTTPS.

## Independent eligibility review

- Approvers authenticated via allowlisted admin email can list
  `GET /api/v1/admin/admission/pending`.
- Approve via `POST /api/v1/admin/admission/{id}/approve` with JSON
  `{"evidenceNote":"Business ownership checked against independent source"}`.
- Reject via corresponding `/reject`.
- Reviewer should verify current company/ownership evidence independently,
  not just LinkedIn name, self-entered role or email OTP.
- Both paths leave members pending and **do not issue JWTs** until approval.
- Historic members without membershipStatus are unchanged; audit them separately.

## Release blockers

1. Configure LinkedIn product and OAuth redirect in developer portal, verify
   actual claims with a real account and ensure callback works in Android and web.
2. Configure production mail delivery; verify both email OTP and LinkedIn flows.
3. Add explicit admin review operations, seed an approved admin.
4. Verify backend deployment actually uses the Python/MongoDB API; old Node/Postgres
   backend has different routes. Never switch production API host casually.
5. Exercise non-founder rejection, duplicate account, state replay, expired OTP,
   OAuth callback cancellation, pending login blocked, approval/rejection and deletion.
6. Tests, EAS signed AAB, Google Play internal testing and then gated production release.
7. Review privacy consent/disclosure around stored LinkedIn data.

Publishing is blocked pending end-to-end tests and app credentials.
