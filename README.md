# B Square — Full Stack Setup Guide

## What This App Does
B Square is a B2B networking platform where verified business professionals
connect with others nearby. Every user is manually verified before being
allowed in — no fake accounts.

---

## PAGE BY PAGE FLOW

### 1. /register — Create Account (3 steps)
**Step 1 — Business Info**
- Full name, business name, industry, city, bio
- Browser asks for GPS location immediately (live tracking starts here)

**Step 2 — Verification (choose one of 3)**
- DIN: Submit 8-digit Director Identification Number + your name as on MCA.
  Admin manually checks at mca.gov.in before approving.
- Business Succession: For sons/family who inherited a business.
  Submit previous owner's DIN, your new DIN (if obtained), describe the
  board resolution or succession document. Admin reviews manually.
- LinkedIn: For freelancers/consultants without a DIN.
  Admin reviews your LinkedIn profile for genuine business activity.

**Step 3 — Account Details**
- Email (required), Phone (required), Password, Confirm Password
- On submit → account created with "pending" status
- User sees "Application submitted!" screen
- Cannot log in until admin approves

### 2. /login — Sign In
- Email + password
- If pending → error message shown
- If rejected → rejection reason shown
- If approved → lands on Nearby page

### 3. / (Nearby) — Discover Businesses
- Shows all approved verified businesses within your radius (default 10km)
- Radius slider: drag to expand/shrink
- Industry filter: type to filter
- Each card shows: business name, industry, verification type badge, bio, distance
- Connect button → sends connection request
- Status updates: "Request Sent", "Connected", "Wants to Connect"

### 4. /connections — Your Connections
- Lists all accepted connections
- Contact details (email + phone) only visible after connection is accepted
- Message button → opens chat modal
- Remove button → removes connection (can reconnect later)

### 5. /requests — Connection Requests
**Received tab:**
- Accept → creates connection + auto-sends contact details to both users as system message
- Decline → declines the request

**Sent tab:**
- Shows pending sent requests
- Cancel → cancels the request

### 6. /profile — My Profile
- View all your info
- Edit profile (name, phone, bio, industry)
- Change password
- Sign out

### 7. /admin — Admin Panel (admin only, visible in navbar)
**Stats dashboard:**
- Pending count, Approved Today, Total Approved, Rejected, Total Users

**Pending tab:**
- All users awaiting review
- DIN users: shows DIN + director name + direct "Verify on MCA ↗" link
- Succession users: shows prev/new DIN + document description
- LinkedIn users: shows clickable profile link
- Approve button → user gets access immediately
- Reject button → requires reason, shown to user on login attempt

**All Users tab:**
- Full list of all users with their verification status

### 8. Chat (floating modal)
- Opens when you click Message on a connection
- On connection accept → auto system message sent to both users with contact details
- System messages shown in green bubble
- Polls for new messages every 4 seconds
- Send with Enter key or Send button

---

## LOCATION TRACKING
- On registration: browser asks permission → GPS coords saved
- While app is open: watchPosition runs silently, updates location in DB
- Nearby page: uses your real coordinates to calculate distances in SQL
- If location denied: city center coordinates used as fallback

---

## SETUP (Windows)

### Prerequisites
- Node.js: https://nodejs.org (LTS version)
- PostgreSQL: already installed on your machine

### Step 1 — Reset Database (pgAdmin)
Run in Query Tool on `bsquare` database:
```sql
DROP TABLE IF EXISTS messages, refresh_tokens, connections, connection_requests, users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
```
Then paste and run entire contents of `backend/db/schema.sql`

### Step 2 — Create admin password
In backend terminal:
```
node -e "require('dotenv').config();const b=require('bcryptjs'),db=require('./db');b.hash('Admin@1234',12).then(h=>db.query('INSERT INTO users(name,email,password_hash,phone,verification_type,verification_status,is_admin,city,lat,lng) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',['Admin','admin@bsquare.in',h,'0000000000','admin','approved',true,'Hyderabad',17.385,78.4867]).then(()=>{console.log('Admin created');process.exit()}))"
```

### Step 3 — Backend
```
cd backend
npm install
npm run dev
```

### Step 4 — Frontend (new terminal)
```
cd frontend
npm install
npm start
```

### Admin Login
- Email: admin@bsquare.in
- Password: Admin@1234

---

## API ENDPOINTS
POST   /api/auth/register          — Register new user
POST   /api/auth/login             — Login
POST   /api/auth/refresh           — Refresh JWT token
POST   /api/auth/logout            — Logout
GET    /api/auth/me                — Get current user
PUT    /api/auth/me                — Update profile
PUT    /api/auth/location          — Update GPS location
PUT    /api/auth/change-password   — Change password

GET    /api/users/nearby           — Nearby approved users (with distance)
GET    /api/users/:id              — Public profile

POST   /api/connections/request/:id       — Send connection request
PUT    /api/connections/request/:id/accept — Accept (auto-sends contact details)
PUT    /api/connections/request/:id/decline — Decline
DELETE /api/connections/request/:id       — Cancel sent request
DELETE /api/connections/:id               — Remove connection
GET    /api/connections                   — List my connections
GET    /api/connections/requests/received — Received pending requests
GET    /api/connections/requests/sent     — Sent pending requests

POST   /api/messages/:targetId     — Send message
GET    /api/messages/:targetId     — Get conversation
GET    /api/messages               — List all conversations

GET    /api/admin/stats            — Dashboard stats
GET    /api/admin/pending          — Pending verification queue
GET    /api/admin/users            — All users
PUT    /api/admin/users/:id/approve — Approve user
PUT    /api/admin/users/:id/reject  — Reject user (requires reason)
PUT    /api/admin/users/:id/deactivate — Deactivate user
