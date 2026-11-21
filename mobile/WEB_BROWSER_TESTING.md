# Bsquare browser test (no APK)

This branch contains the real Expo/React Native UI. You can run it in a browser.
This is separate from the standalone 21-screen design walkthrough.

## Test in GitHub Codespaces (100% in the browser)

1. In GitHub, open this branch: `design/opal-blue-neon-ui`.
2. Click **Code → Codespaces → Create codespace on design/opal-blue-neon-ui**.
3. Wait for the project dependencies to install automatically.
4. In the Codespaces terminal, run:

```bash
cd mobile
npx expo start --web --port 8081
```

5. GitHub Codespaces will forward port 8081. Click **Open in Browser** when it appears or open the **Ports** tab and select the `Bsquare Expo Web` port.

You will see the *real app's screens* inside a desktop browser, with a narrow mobile-sized viewport. Onboarding and login can be inspected without a backend. Authenticated sections need your backend and a valid approved member account.

### To test real sign-in/discovery/chat safely

Configure `EXPO_PUBLIC_BSQUARE_API_URL` through `mobile/.env.local` in Codespaces to your approved staging API endpoint, for example:

```env
EXPO_PUBLIC_BSQUARE_API_URL=https://YOUR-STAGING-API.example
```

Restart Expo after changing environment variables. Never put private server credentials or passwords inside `EXPO_PUBLIC_` variables. Your staging backend must allow the Codespaces preview origin in CORS and return the expected `/api/v1` routes.

## Test locally on a Mac

```bash
git clone https://github.com/cucu-advertising/b-square.git
cd b-square
git checkout design/opal-blue-neon-ui
cd mobile
npm ci
npx expo start --web
```

Open the local URL printed by Expo (typically `http://localhost:8081`).

## Browser vs Android

Browser preview helps check layouts, typography, onboarding, navigation and web-supported features. It **does not** replace Android-device testing for haptics, safe areas, native storage, push notifications, permissions, Play signing or Google Play validation.

The 21-screen HTML design preview uses mock graphics and is **not** the production app.
