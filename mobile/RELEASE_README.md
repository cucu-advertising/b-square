# B Square integration — release preparation

## Current authentication
This version uses the existing PostgreSQL/Express **email + password** backend. Membership application is manually reviewed, and JWT tokens only issue to approved members. **SMS is not implemented** and is not represented as functional. The user must receive and retain initial login credentials from registration.

## Required setup
1. Deploy the backend with PostgreSQL, valid JWT secrets, HTTPS, CORS and the backend's actual schema; do not upload .env secrets.
2. Create `mobile/.env` from `.env.example`: verify the existing Render API (`https://bsquare-backend.onrender.com`) and set `EXPO_PUBLIC_BSQUARE_API_URL` to the confirmed deployed HTTPS host. All `EXPO_PUBLIC_` vars are public in the client; never store signing secrets here.
3. From mobile: `npx expo install expo-secure-store react-native-web @expo/metro-runtime` and `npm install`.
4. Re-generate and commit `package-lock.json`; from mobile run `npx expo install --check` and `npx tsc --noEmit`.
5. Provision existing iOS and Android app identifiers, EAS project ID, signing credentials and store accounts. Do NOT invent new IDs if apps already exist.
6. Build preview binaries and run test scenarios on actual iOS and Android devices, plus API tests against a staging PostgreSQL database.

## Required staging tests
- Register user; confirm `pending` (not auto-approved); admin reviews; login only after approval.
- Login with valid credentials; refresh token; restart app; sign out; reject expired or revoked credentials.
- Nearby members (same city when precise coordinates not available), nonmembers excluded.
- Two approved users exchange connection request, accept, read/write conversation; unconnected users denied.
- Report user; block user; verify directory, profiles, messages, connections and requests no longer reveal/block interactions; unblock.
- Delete account with in-app confirmation; verify that DB cascade deletes personal records and tokens, and that subsequent login is rejected.
- Test degraded/offline API states, Android hardware back, iOS safe areas, keyboard overlap, font loading, haptics, privacy copy, and review credentials.

## Known remaining release blockers
- SMS provider and real phone verification deferred until deployed and configured.
- Existing backend .env was previously tracked: **assume secrets compromised**; rotate credentials and remove secrets from Git history using an approved method.
- The old repo contains demo screens (`otp.tsx`, `onboarding.tsx`, `admission-status.tsx`) which are not part of the authenticated production flow. Ensure they're removed/inaccessible in release builds.
- Apple/Google submission, signing and live-device tests require authorized developer accounts and hardware.
- Account data retention, privacy policy, terms, abuse moderation operations, and backend host require owner approval.

Status: local integration draft. No live environment acceptance test was possible in this environment.
