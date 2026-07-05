
You picked an external Mongo+Node API. I'll scaffold both halves in this repo:

## What I'll build

### 1. Backend API — new `server/` directory (you deploy to Render/Railway/Fly)
Stack: Node 20 + Express + Mongoose + JWT + bcrypt + zod + helmet + cors.

```
server/
  src/
    config/db.ts, env.ts
    models/        User, Profile, Business, Sale, Expense, InventoryItem, Employee, Notification
    middleware/    auth.ts (JWT verify), requireRole.ts, error.ts, validate.ts
    routes/        auth, businesses, sales, expenses, inventory, employees, notifications, dashboard
    services/      inventory (stock decrement, low-stock alerts), notifications, analytics
    utils/         hash, jwt (access 15m + refresh 7d, rotated)
    seed.ts        seeds the 4 demo businesses + sample data per new user
    index.ts
  package.json, tsconfig.json, .env.example, README.md
```

Features: JWT access+refresh with rotation, bcrypt password hashing, role enum (admin/manager/employee), Mongoose schemas with indexes/validation/timestamps, pagination + filter + search on list endpoints, zod request validation, helmet, CORS, structured error responses, low-stock + high-expense notification logic, atomic stock decrement on sale (prevents negative stock via `$inc` with conditional filter), dashboard aggregation pipeline for revenue/profit/growth.

### 2. Frontend changes — keep existing design
- New `src/lib/api/` — typed fetch client with `VITE_API_URL`, auto attach access token, auto refresh on 401, retry once.
- New `src/lib/auth/` — replace mock `authStore` with real JWT context, `useAuth()`, `useRole()`, persisted refresh token, `onAuthStateChange`-like store.
- `src/routes/app.tsx` — real `beforeLoad` redirect using token presence; child routes use role guards.
- Replace `src/lib/mock-data.ts` consumers with TanStack Query hooks (`useBusinesses`, `useSales`, …). Keep the file as types-only.
- Real CRUD pages: businesses, sales (with inventory decrement), expenses, inventory, employees. Add/Edit dialogs using existing shadcn components.
- Dashboard cards + charts pull live aggregates from `/api/dashboard` — no more static numbers.
- Notifications bell wired to `/api/notifications` with polling (10s) — kept simple, no websockets (Workers limitation).
- Loading skeletons, empty states, error boundaries per route, toast (sonner) on mutations.
- Login/Register call real `/auth/login`, `/auth/register`; refresh page keeps session.
- Mobile pass: sidebar already responsive; audit tables → cards on `sm`.

### 3. Security
Helmet, CORS allowlist via env, zod input validation, bcrypt (12 rounds), JWT secrets via env, refresh-token rotation + revoke list, password min 8 + zxcvbn-lite check, server-side role checks on every protected route. (Skipping rate limiting per platform note — you can add `express-rate-limit` yourself in 2 lines if you want it; I'll leave a TODO.)

### 4. Docs
`server/README.md` — env vars, `npm i && npm run dev`, deploy steps (Render one-click style). Root `README.md` updated: set `VITE_API_URL` then `bun dev`.

## What you do after I'm done
1. `cd server && npm install && cp .env.example .env` — fill `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`.
2. `npm run dev` locally, or deploy to Render/Railway (free tiers work).
3. Set `VITE_API_URL=https://your-api.example.com` in Lovable → Project Settings → Build Secrets (or it falls back to `http://localhost:4000` in dev).
4. Sign up — seeder auto-creates the 4 demo businesses + sample sales/expenses/inventory on first login.

## Scope honesty
This is ~40 files. I'll do it in one turn but expect to spend significant tool calls. I will NOT redesign the UI — only swap data sources and add CRUD dialogs that match existing styling. Charts (Recharts) stay; just fed live data.

## Out of scope (tell me if you want any of these next)
- Realtime websockets (Cloudflare Workers can't host them; would need separate service)
- Stripe billing
- Email sending (need Resend/SES creds)
- File uploads (need S3/R2)
- Rate limiting on the API (trivial to add yourself)

Confirm and I'll execute.
