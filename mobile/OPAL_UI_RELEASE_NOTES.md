# Bsquare Royal Blue + Neon UI refresh

## Source
The user-approved 21-screen Bsquare Opal-inspired Figma ZIP (Nov 2026), using:
- Deep blue `#061B53`, royal blue `#0B2980`
- Neon lime `#DFFF73`, white `#FAFBFF`
- Ubuntu; text-first editorial onboarding; minimal panels; neon vector navigation

## Feature parity and safety
- Existing package ID `com.cucuadvertising.bsquare` and EAS project retained.
- Email-code sign-in, password sign-in, email verification, manually approved membership, discovery, requests, chats, report/block, and in-app account deletion are retained.
- LinkedIn profile URL is review evidence, **not LinkedIn SSO**. Do not advertise an SSO connection until actually implemented and tested.
- Events tab is visually present, but public event discovery and posting are not yet functional. The screen must clearly disclose that events are coming soon.
- Design-sample people, events, social proof, and counts from the Figma package are **not** inserted into production.

## Before Android production
1. Run `cd mobile && npm ci && npx expo install --check && npx tsc --noEmit` using Node compatible with Expo SDK 57.
2. Test on physical Android devices: navigation, sign-up/email code, approval, sessions, discovery, requests, messaging, block/report, and account deletion.
3. Verify production backend availability/keys, secret rotation and moderation; do not publish if release checklist blockers remain.
4. Check the **current highest Play Console versionCode**, then increment the Android remote EAS build version before building. Do not assume `3` is unused.
5. Confirm Play app signing credentials and package ID match the existing listing; run `eas build --platform android --profile production` to generate an AAB.
6. Deploy to Google Play internal test first. `eas submit --platform android --profile production` uploads a draft to the internal track under the existing `eas.json`; it does **not** automatically publish to production.
7. Test the Play-distributed AAB, then create/review a production rollout in Play Console.
8. Check current privacy disclosures, store screenshots, member report/block policies and all release blockers in `mobile/RELEASE_CHECKLIST.md`.

This commit is a UI implementation candidate, **not** an approved production release.
