# Bsquare Club — Apple App Store submission gate

Last preparation pass: 14 November 2026. This is a release **checklist**, not evidence that Apple accepted a binary.

## Existing iOS identity

- App: **Bsquare Club**, existing App Store Connect record
- Bundle identifier: `com.cucuadvertising.bsquare` (do not create a duplicate app)
- Previously discussed build: `1.0.0 (2)`; confirm latest TestFlight/App Store Connect build before assigning a new one
- Working Git branch: `feature/verified-admission-and-safety` (do not merge to main just for submission)
- UI: dark black/graphite, lighter azure; Ubuntu

## Release gates (all must pass)

- [ ] GitHub Actions **Bsquare iOS release checks** is green: `npm ci`, Expo compatibility, TypeScript, app identity.
- [ ] EAS project/owner are linked to the **existing** Bsquare Club project and Apple team.
- [ ] In EAS production env, `EXPO_PUBLIC_BSQUARE_API_URL` points to the production FastAPI mobile backend at `https://api.bsquare.club`, not the separate Express `/api` backend. Confirm `<BASE_URL>/api/v1/health` returns status `ok`.
- [ ] iOS Firebase `BSQUARE_GOOGLE_SERVICE_INFO_PLIST` EAS file secret and native Firebase configuration are present, or explicitly remove/disable the native phone-auth feature before building. Do not ship an exposed broken SMS flow.
- [ ] Confirm the existing App Store Connect latest iOS build number and run `eas build:version:set` for **iOS** before the first build under remote versioning. Production auto-increments iOS versions.
- [ ] Build and launch on a **physical iPhone**. Verify login, profile, discovery, requests, chat, block/report and destructive account deletion.
- [ ] Provide a permanent **pre-approved demo account** with real data and at least one other discoverable verified member in the same city for App Review. Provide a **second demo account** for deletion testing. Do not use real personal accounts or guess credentials.
- [ ] Check `https://bsquare.club/privacy-policy` and `https://bsquare.club/delete-account/` publicly load and are consistent with actual retention, Firebase SMS, account deletion, and data-processing practices.
- [ ] Confirm `support@bsquare.club` receives mail and moderation reports have an actual human response workflow. Apple Guideline 1.2 requires UGC filtering, reporting, blocking and public contact details.
- [ ] App Store Connect privacy answers, age rating, screenshot sizes, description, support URL, app review contact and content rights are complete.
- [ ] Use **real screenshots from the shipping build**. Do not upload concept mockups.
- [ ] Events tab intentionally hidden pending implementation of Events API in the FastAPI backend.

## Build, upload, submit

From the working clone after `git pull`:

```bash
cd mobile
npm ci
npx expo install --check
npx tsc --noEmit
npx expo config --json
npm install --global eas-cli
eas login
eas project:info
eas build:version:set      # choose iOS; seed to the latest actual App Store Connect build number
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

EAS Submit uploads the .ipa to App Store Connect/TestFlight; it **does not** press Apple's final Submit for Review button. In App Store Connect, select the newly processed build, fill metadata/screenshots/demo credentials and press **Add for Review** then **Submit for Review**. Acceptance is decided by Apple.

## Suggested App Review notes (replace brackets)

Bsquare Club is a verified business networking platform for approved Indian business owners. Applications require manual review, so please use the pre-approved review accounts below rather than signing up and waiting for approval.

Main reviewer account: [APPROVED EMAIL] / [PASSWORD]
Separate account for testing permanent deletion: [DELETION EMAIL] / [PASSWORD]

After login, **Discover** displays other approved business owners. Open a member profile to see **Report member** and **Block member**. **Profile > Blocked members** allows review and reversal of blocked members. To permanently delete an account, sign in to the separate deletion account, open **Profile**, enter its password in the account deletion confirmation field, and tap **Delete my account permanently**.

Please test connecting and messaging with seeded approved members. We have disabled the unfinished Events UI in this release. User safety inquiries: support@bsquare.club.

## Known verification limits

This file does not establish that the backend, SMTP, Apple Developer connection, iOS signing certificates, Firebase iOS credentials, reviewer accounts, moderation operations, or the public legal pages are working; confirm each before actual submission.
