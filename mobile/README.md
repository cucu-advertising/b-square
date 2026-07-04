# B Square (mobile prototype)

A location-based B2B networking app for verified business owners — front-end
prototype built with Expo (React Native) + TypeScript. All data is mocked
locally; there is no backend yet.

## Stack

- Expo (SDK 57), TypeScript, `expo-router` (file-based navigation)
- `react-native-reanimated` + `react-native-gesture-handler` for animation/gestures
- `expo-linear-gradient`, `expo-blur`, `react-native-svg` for glass/holo surfaces
- `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono`
- `lucide-react-native` for icons
- `zustand` for theme, mock data and auth-flow state

## Getting started

```bash
npm install
npm start
```

Then press `i` / `a` in the terminal (or scan the QR code with Expo Go) to
run on iOS / Android. `npm run web` runs a browser preview.

## Structure

```
app/                   expo-router screens (splash → login → otp → onboarding → tabs)
  (tabs)/              bottom tab navigator: nearby, requests, chats, profile, palette
  profile/[id].tsx      profile detail, pushed from Nearby
  chat/[id].tsx          placeholder chat thread (stub, not the focus of this build)
components/            VerifiedSeal, BusinessCard, GlassCard, buttons, Toast, ThemeCard, ...
lib/                   theme system (THEMES + zustand store), mock data, fonts
hooks/                 usePressScale, useReducedMotion, useFocusPointerEvents
```

## Notes

- The **Palette** tab is a live theme switcher kept in the shipped tab bar so
  stakeholders can flip between the 5 themes during demos. It should be moved
  behind a hidden dev menu (or removed) before a real release — see the
  comment in `app/(tabs)/_layout.tsx`.
- Every verified profile renders the signature `VerifiedSeal` — a rotating
  holographic ring approximated with an oversized rotating linear gradient
  clipped to a circle (React Native has no native conic/sweep gradient).
- Decorative loops (seal rotation, splash pulse) are skipped automatically
  when `AccessibilityInfo.isReduceMotionEnabled()` is true; press feedback
  and toasts always run.
