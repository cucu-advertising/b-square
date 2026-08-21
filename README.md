# B Square — Mobile Setup Guide

## What This App Does
B Square is a B2B networking platform where verified business professionals
connect with others nearby. Every user is verified before being allowed in —
no fake accounts.

The Flutter app in `mobile/` talks to the FastAPI service in `backend-mobile/`
(MongoDB, port 5001).

---

## SCREEN BY SCREEN FLOW

Flutter app in `mobile/`. All screens talk to `backend-mobile` on port 5001.

### 1. Welcome
- Brand header on the auth background
- Sign in with LinkedIn (placeholder for now)
- More options → Create account or Sign in with email

### 2. Sign in
- Email + password
- Calls `POST /api/v1/auth/login`
- On success → Home (Discover tab)
- Wrong email / password → error shown on the form

### 3. Create account (9 steps, shared progress bar)
Signup state lives in `SignupFlowProvider` (`SignupData`) until the last step,
then it is sent to the API.

**Step 1 — Name**
- First name, last name

**Step 2 — Account**
- Email, password (min 8), confirm password

**Step 3 — Images**
- Profile photo + company logo
- Then gallery (up to 4 business photos)

**Step 4 — Verification (choose one of 3)**
- DIN: 8-digit DIN + director name as on MCA
- Business Succession: previous DIN, new DIN, succession note
- LinkedIn: profile URL (`linkedin.com/in/...`)

**Step 5 — Business**
- Business name, industry, city, bio

**Step 6 — About you**
- Founder name, company name, role, year founded, company size, revenue range

**Step 7 — Business goals**
- One primary goal (clients, partners, investment, etc.)

**Step 8 — Connect with**
- Who they want to meet (manufacturers, investors, …)

**Step 9 — Interests**
- Up to 5 business interests
- On Next → `POST /api/v1/auth/register` then `PATCH /api/v1/users/me/onboarding`
- Photos upload via `POST /api/v1/users/me/images`
- Then “Great start” + profile preview → Home

Duplicate email or DIN returns **409** (including two people registering at once).

### 4. Home — Discover
- Bottom nav: Discover / Messages / Profile
- Card stack of other members (no email in the payload)
- Connect → sends a connection request
- Pass → hides that profile
- Open the card → member profile
- First launch asks for notification permission

### 5. Messages
**Chats tab:**
- Conversation list with unread counts
- Tap → chat thread (connected members only)

**Requests tab:**
- Received requests: accept / decline
- Sent request updates (accepted / declined)

**Connections tab:**
- Accepted connections → open chat or profile

Live updates come from WebSocket `ws://.../api/v1/ws/chat` (`ChatSocket`).
The socket only notifies (new message / read). Sending still uses REST.

### 6. Profile (own)
- View own card, stats (connections, views, matches)
- Edit profile
- Share profile
- Sign out (clears tokens)

### 7. Member profile
- Public profile (email stripped)
- Recording a view increments their profile-view count
- Connect / message depending on connection state

### 8. Chat thread
- Load history, send, mark read
- New messages refresh over the WebSocket

---

## ARCHITECTURE

```text
mobile/ (Flutter)                         backend-mobile/ (FastAPI)
─────────────────                         ─────────────────────────
screens  →  services  →  ApiClient   →    /api/v1 routers
models / providers                        services
theme / widgets                           repositories
                                          MongoDB (bsquare_mobile)
```

### Flutter (`mobile/lib/`)
Screens stay thin. They call services; services call `ApiClient`.

| Layer | What it does |
| --- | --- |
| `screens/` | Welcome, signup, home tabs, chat thread, member profile |
| `services/` | `AuthService`, `ConnectionService`, `ChatService`, `ChatSocket`, `ApiClient`, token storage |
| `models/` | Signup payload, discover cards, requests, chat |
| `providers/` | `SignupFlowProvider` — shared 9-step signup state |
| `config/api_config.dart` | Base URL (Android emulator: `10.0.2.2:5001`) |

### FastAPI (`backend-mobile/app/`)
Routers handle HTTP. Services own rules. Repositories talk to MongoDB.

| Layer | What it does |
| --- | --- |
| `api/v1/` | Auth, users, connections, notifications, messages, health, chat WebSocket |
| `services/` | Register/login, discover, connect/pass, chat, uploads |
| `repositories/` | users, requests, connections, conversations, messages, notifications, passes, views |
| `schemas/` | Request/response models (camelCase, matching Flutter) |
| `db/connection.py` | Mongo indexes (unique email, unique DIN) |
| `core/security.py` | JWT access + refresh tokens |

Public discover / other-profile responses **do not include email**.
The chat WebSocket is notify-only — it does not write messages.

---

## SETUP (Windows)

### Prerequisites
- Flutter SDK
- Python 3.11+
- MongoDB running locally

### Step 1 — Mobile API
```
cd backend-mobile
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```
API: `http://127.0.0.1:5001`  ·  docs: `http://127.0.0.1:5001/docs`  
MongoDB default: `mongodb://127.0.0.1:27017/bsquare_mobile`

### Step 2 — Flutter app (new terminal)
```
cd mobile
flutter pub get
flutter run
```
Point the app at the API in `mobile/lib/config/api_config.dart`.
On a physical phone, set `deviceHostOverride` to your PC LAN IP.

---

## API ENDPOINTS (FastAPI, prefix `/api/v1`)

GET    /health                         — Service health

POST   /auth/register                  — Create account + tokens
POST   /auth/login                     — Login
POST   /auth/refresh                   — Refresh JWT
POST   /auth/logout                    — Logout
GET    /auth/me                        — Current user (includes email)

GET    /users/options                  — Signup dropdowns (industries, cities, …)
GET    /users/discover                 — Discover cards (email stripped)
POST   /users/discover/:id/pass        — Pass a profile
GET    /users/me/stats                 — Own profile stats
PATCH  /users/me/onboarding            — Save onboarding fields
PATCH  /users/me/profile               — Edit profile
POST   /users/me/images                — Upload photo / logo / gallery
GET    /users/:id                      — Public profile (email stripped)
POST   /users/:id/view                 — Record a profile view

POST   /connections/request/:id        — Send request
PUT    /connections/request/:id/accept — Accept
PUT    /connections/request/:id/decline — Decline
DELETE /connections/request/:id        — Cancel sent request
GET    /connections/requests/received  — Received pending
GET    /connections/requests/sent      — Sent pending
GET    /connections                    — Accepted connections

GET    /notifications                  — Inbox
GET    /notifications/unread-count     — Unread count
PUT    /notifications/:id/read         — Mark one read
PUT    /notifications/read-all         — Mark all read

GET    /messages                       — Conversation list
GET    /messages/:peerId               — Thread history
POST   /messages/:peerId               — Send message
PUT    /messages/:peerId/read          — Mark thread read

WS     /ws/chat?token=...              — Live chat notifications (no writes)
