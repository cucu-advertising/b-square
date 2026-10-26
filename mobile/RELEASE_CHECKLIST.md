# B Square release checklist

Integration is email/password authentication with manual approval. SMS is deferred; no working SMS is claimed. Not ready for store submission until tested end-to-end.

- [ ] Regenerate package-lock.json, run npm install, npx expo install --check and npx tsc --noEmit.
- [ ] Deploy backend safely and verify production PostgreSQL migrations, CORS, and JWT configuration.
- [ ] Test registration, admin approval, login, refresh, discovery, messaging, blocking, reporting and account deletion with two live users.
- [ ] Rotate previously tracked backend/.env credentials and remove historical secrets from Git history with owner approval.
- [ ] Confirm existing iOS and Android store IDs, EAS signing credentials, reviewer credentials, privacy policy and deletion URL.
- [ ] Validate real iOS/Android device builds and store compliance before publishing.
