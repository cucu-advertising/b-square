# B Square

## Overview

B Square is a verified B2B networking platform. The idea is simple: business people should be able to find other real businesses nearby, understand what they do, and connect — without fake profiles or cold social spam.

Members join as founders, directors, and consultants. Each person builds a business profile (who they are, the company, industry, city, goals, and who they want to meet). Verification is part of signup, using a Director Identification Number (DIN), a LinkedIn profile, or a business-succession path. The product is built around trust first, then discovery and conversation.

The tagline of the product is **Business · Verified · Nearby**.

## About the app

This folder is the Flutter mobile client. It talks to the FastAPI service in `backend-mobile` (port 5001).

After welcome and sign-in, a new member walks through a 9-step signup: name, account, photos, verification, business details, about you, goals, who they want to connect with, and interests. Once in the app, the home experience is:

- **Discover** — swipe through other members’ cards and send a connection request, or pass
- **Messages** — chats with accepted connections, plus request / notification updates
- **Profile** — own profile, edit, share, and view another member’s public profile

Contact and chat stay behind an accepted connection. Live chat updates use a WebSocket (`ChatSocket`) on top of REST.

The older web product (`frontend` + Node `backend`) is a separate stack. This Flutter app does **not** use that API.

## Code architecture

The mobile app and its API are split on purpose: UI in Flutter, business logic and data in FastAPI + MongoDB.

```text
Flutter app (this folder)                 backend-mobile
─────────────────────────                 ──────────────
screens  →  services  →  ApiClient   →    /api/v1 routers
models / providers                        services
theme / widgets                           repositories
                                          MongoDB
```

**Flutter (`lib/`)** keeps screens thin. Screens call services; services talk to the API.

| Layer | Role |
| --- | --- |
| `screens/` | Welcome, signup, home tabs (discover / messages / profile), chat thread |
| `services/` | `AuthService`, `ConnectionService`, `ChatService`, `ChatSocket`, `ApiClient`, token storage |
| `models/` | Signup payload, discover cards, connection requests, chat |
| `providers/` | Signup flow state shared across the 9 steps |
| `widgets/` / `theme/` | Shared UI (glass cards, onboarding fields, brand) |

**Backend (`backend-mobile/`)** is a layered FastAPI app. Routers stay HTTP-shaped; services own rules (auth, connections, messages); repositories talk to MongoDB collections (users, requests, connections, conversations, messages, notifications). JWT access + refresh tokens authenticate REST and the chat WebSocket.

Public member payloads (discover and other profiles) do not include email. Duplicate email / DIN on register is rejected as a conflict, including concurrent signups.

## Run locally

```bash
cd mobile
flutter pub get
flutter run
```

Point the app at your API in `lib/config/api_config.dart` (Android emulator uses `10.0.2.2:5001`). See `backend-mobile/README.md` to start MongoDB and the API.
