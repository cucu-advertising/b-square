# B Square

Full-stack B2B networking platform. Three parts:

- `backend/` — Node/Express REST API + PostgreSQL (`pg`). Runs on port `5000`.
- `frontend/` — React (Create React App) web client. Runs on port `3000`.
- `mobile/` — Expo (React Native) prototype using **mock data only** (`mobile/lib/mockData.ts`); it does not talk to the backend.

Standard run/build commands live in `README.md`, `mobile/README.md`, and the `scripts` blocks of each `package.json`.

## Cursor Cloud specific instructions

The update script only refreshes npm dependencies. PostgreSQL and the seeded
`bsquare` database live in the VM snapshot, so the notes below cover the
non-obvious startup/run caveats.

### PostgreSQL (backend dependency)
- Postgres 16 is installed but does **not** auto-start in this container. Start it each session with:
  `sudo pg_ctlcluster 16 main start`  (check with `pg_lsclusters`).
- Connection details already match `backend/.env`: db `bsquare`, user `bsquare_user`, password `Test1234`, port `5432`.
- If the database is missing (fresh volume), recreate it: create role `bsquare_user`, `createdb -O bsquare_user bsquare`, run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` as the `postgres` superuser, load `backend/db/schema.sql`, then from `backend/` run `npm run seed` and create the admin user (one-liner in `README.md` step 2). The backend also auto-creates the `events` table on boot.

### Test accounts
- Admin: `admin@bsquare.in` / `Admin@1234`.
- Seeded "bot" businesses (approved + onboarded): `*.bsquare.test` (e.g. `priya.tech@bsquare.test`) / `Test@1234`.

### Frontend ↔ backend wiring (important)
- `frontend/src/api/index.js` hardcodes the **remote** Render backend URL. To exercise the frontend against the **local** backend, temporarily change that `baseURL` to `"/api"` — `frontend/package.json` has `"proxy": "http://localhost:5000"`, so CRA forwards `/api` to the local backend. Do not commit that change.

### Mobile (Expo) caveats
- The committed `mobile/package.json` is missing `react-native-worklets` (a required peer of `react-native-reanimated@4.5`, referenced by `babel.config.js`), and the committed `mobile/package-lock.json` nests `babel-preset-expo` under `expo/node_modules`. A lock-faithful `npm install` therefore cannot start Metro. Install as the update script does: remove the mobile lockfile, then `npm install --legacy-peer-deps ... react-native-worklets@0.10.1` (fresh resolution hoists `babel-preset-expo` correctly).
- Start Metro with `npx expo start` (from `mobile/`). There is no device/emulator in this headless VM, so verify the app compiles with `npx expo export --platform ios` instead of launching it visually.
- `npx expo start --web` additionally needs `react-dom` + `react-native-web`, which are **not** declared; web preview is not set up.
