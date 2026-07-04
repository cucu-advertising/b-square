# B Square — Mobile Prototype

A location-based B2B networking app for **verified business owners**, built with
Expo (React Native) + TypeScript. This is a **front-end prototype**: all data is
mocked locally and connect / accept / decline actions run against in-memory state
— there is no backend.

## Design language

Dark-first, glass-surfaced, holographic accents. Every verified profile carries a
rotating **conic-gradient "seal"** (`<VerifiedSeal />`) instead of a flat badge —
that's the signature visual element, reused everywhere a business is marked
verified. Motion is physical: press states scale down, seals slowly rotate, and
lists enter with a staggered fade + slide.

Everything reads from a live **theme system** (5 selectable themes). Switching a
theme in the Palette tab re-renders every screen instantly. Nothing is hardcoded.

## Stack

- Expo SDK 57, TypeScript, `expo-router` (file-based routing)
- `react-native-reanimated` + `react-native-gesture-handler` (animation / gesture)
- `expo-linear-gradient`, `expo-blur` (gradients + frosted glass)
- `react-native-svg` (conic-gradient seal + radial hero glow)
- `@expo-google-fonts/*` — Space Grotesk (display), Inter (body), JetBrains Mono (data)
- `lucide-react-native` (outline icons)
- `zustand` (theme, mock data, flow state)

## Run

```bash
cd mobile
npm install
npm start        # then press i / a, or scan the QR with Expo Go
```

Other scripts: `npm run ios`, `npm run android`, `npm run web`, `npm run typecheck`.

> Dependencies use `legacy-peer-deps` (see `.npmrc`) because Expo Router pulls in
> some web-only peers with strict React ranges.

## Structure

```
app/
  _layout.tsx        root stack: splash → login → otp → onboarding → (tabs)
  index.tsx          splash (pulsing logo + expanding ring)
  login.tsx          phone entry (+91)
  otp.tsx            4-box OTP with active-box blink
  onboarding.tsx     build-your-card (rotating holo avatar, industry chips)
  (tabs)/
    _layout.tsx      custom glass bottom tab bar (coral dot on Requests)
    nearby.tsx       discover feed of BusinessCards
    requests.tsx     accept/decline with slide-out + toast + empty state
    chats.tsx        conversation list
    profile.tsx      self card + menu
    palette.tsx      live theme picker + swatch QA panel
  profile/[id].tsx   pushed profile detail (hero, fact grid, intent, sticky CTA)
components/          VerifiedSeal, ConicGradientRing, BusinessCard, GlassCard,
                     PrimaryButton, GhostButton, Toast, ThemeCard, ...
lib/                 theme.ts (THEMES + zustand), mockData.ts, store.ts, ...
```

## Notes for a real release

- The **Palette** tab is a live theme switcher kept in the shipped nav *for this
  prototype* so stakeholders can flip themes live. Before release it should be
  removed or moved to a hidden dev menu (see the comment in `(tabs)/_layout.tsx`).
- Decorative loops (seal spin, splash pulse) automatically pause when the OS
  "reduce motion" setting is enabled; functional feedback (press scale, toasts)
  is always kept.
