# B Square — release blockers and delivery checklist

**Status: NOT READY FOR PUBLIC SUBMISSION.** The application currently includes demo member profiles, mock messages and local-only request state. Production demo onboarding is intentionally disabled until real authentication is integrated.

## Blocking engineering tasks
- [ ] Implement server-generated, rate-limited SMS OTP; verify codes on server; persist authenticated sessions securely.
- [ ] Connect mobile data to authenticated backend APIs: discover, connection requests, messages, member profiles, events.
- [ ] Enforce server-side membership approval: no self-verified LinkedIn URL, work email, or registry field may grant access. Audit existing records for falsely auto-approved accounts.
- [ ] Implement genuine in-app report, block, unblock, and account deletion with authenticated API calls, clear confirmations, and working navigation. Verify deletion of associated data and retention policies.
- [ ] Replace mock members and fake verified labels with real, reviewed accounts. No simulated results in production.
- [ ] Test backend security, protected screens, deletion, connection privacy, and abusive-user flows.

## Store setup
- [ ] Confirm existing Apple bundle identifier and Google Play package name before specifying IDs in app.json. Never change IDs for an existing store app.
- [ ] Configure EAS project linkage, credentials, certificates and service-account access with owners.
- [ ] Verify privacy policy, terms, support contact, account deletion URL, content moderation, data-safety and app-privacy disclosures.
- [ ] Provide working reviewer/demo credentials for Apple, realistic screenshots, accurate store descriptions, and content ratings.
- [ ] Test physical Android and iOS devices (including haptics and reduced-motion) and both landscape constraint and safe areas.
- [ ] Run npm install to regenerate and commit package-lock.json, npx expo install --check, npx tsc --noEmit, and clean Metro/native builds.
- [ ] Review npm audit issues intentionally, never automatically run npm audit fix --force.

## Build when blockers are cleared
From Windows with EAS CLI and appropriate authenticated accounts:
```powershell
cd mobile
npm install
npx expo install --check
npx tsc --noEmit
npx eas-cli@latest build --platform android --profile preview
# After successful testing and integration:
npx eas-cli@latest build --platform all --profile production
```

EAS Build can build iOS in the cloud from Windows. A successful binary build does not certify store approval or production readiness.
