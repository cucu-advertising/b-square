# B Square Mobile

Location-based B2B networking prototype built with Expo (React Native) + TypeScript.

## Run locally

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` for web preview.

## Stack

- **expo-router** — file-based navigation (splash → auth → tabs)
- **zustand** — theme, auth, requests, and toast state
- **react-native-reanimated** — seals, staggered entrances, press feedback, toasts
- **expo-blur + expo-linear-gradient** — glass surfaces and holographic accents

## Screens

| Flow | Screens |
|------|---------|
| Auth | Splash, Login, OTP, Onboarding |
| Tabs | Nearby, Requests, Chats, Profile, Palette (theme picker) |
| Detail | Profile detail (`/profile/[id]`) |

All colors come from the active theme in `lib/theme.ts` — switch themes live on the Palette tab.
