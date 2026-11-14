# B Square Firebase SMS setup

This code signs in existing manually approved members. It never creates or approves membership from SMS alone. Until live SMS is verified, email/password login remains available.

1. Open https://console.firebase.google.com/ and select/create the B Square project.
2. Enable Authentication > Sign-in method > Phone. Restrict regions as appropriate and configure abuse protection.
3. Register the **existing** Android package ID from Google Play Console. In Firebase project settings, provide Google Play App Signing SHA-1 and SHA-256 fingerprints. Download google-services.json; do not commit it.
4. Register the existing iOS bundle identifier. Configure APNs and iOS reCAPTCHA URL scheme as described in Firebase docs. Download GoogleService-Info.plist; do not commit.
5. Set EAS environment variables BSQUARE_ANDROID_PACKAGE (existing Play ID), BSQUARE_GOOGLE_SERVICES_JSON (secure file path), BSQUARE_IOS_BUNDLE_ID, BSQUARE_GOOGLE_SERVICE_INFO_PLIST and EXPO_PUBLIC_BSQUARE_API_URL. The .json and .plist must exist during native EAS config generation.
6. Backend: configure Firebase Admin Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS secure server-side path or managed workload identity). Never put private service-account JSON in app public variables or the repository.
7. Run npm install in backend and mobile, regenerate/commit lockfiles. Expo Go cannot run React Native Firebase; run EAS native development build.
8. Test a Firebase **test phone number** and six-digit test code, then test a real number and real device: invalid/expired codes, resend, blocked SMS, revoked token, accounts pending approval, phone collision and approved member login.
9. Deploy server route before shipping client. Retain current live Google Play app ID, versionCode increment, and signing/upload-key compatibility.
10. Real phone numbers are transmitted to Firebase/Google for verification. Update privacy policy and Play data safety declarations accordingly.

Do not publish until Firebase files, existing app signing IDs, native build and real-device SMS tests succeed.

Official documentation: https://rnfirebase.io/auth/phone-auth and https://docs.expo.dev/guides/using-firebase/
