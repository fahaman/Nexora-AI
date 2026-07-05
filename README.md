# Nexora AI — Multi-business SaaS

Two parts:

- **Frontend** (this folder) — TanStack Start + React 19 + Tailwind v4, deployed on Lovable / Cloudflare Workers.
- **Backend** ([`server/`](./server)) — Node + Express + Mongoose + JWT, deployed separately (Render, Railway, Fly, etc.).

## 1. Run the backend

```bash
cd server
cp .env.example .env   # fill MONGO_URI, JWT_*_SECRET, CORS_ORIGIN
npm install
npm run dev            # http://localhost:4000
```

See [`server/README.md`](./server/README.md) for full endpoint list and deploy steps.

## 2. Point the frontend at the backend

Set the build secret `VITE_API_URL` (Workspace Settings → Build Secrets) to your API base URL, e.g. `https://nexora-api.onrender.com`. For local dev, create `.env.local`:

```
VITE_API_URL=http://localhost:4000
```

If unset, the UI falls back to a demo mode (any credentials work, no persistence) so the preview keeps rendering.

## 3. Sign up

Register a new account at `/register`. The backend automatically seeds 4 demo businesses (Saffron Kitchen, Atelier 22, Northwind Digital, WellCare Pharma) plus sample sales/expenses/inventory/employees, so you land on a populated dashboard.

## Architecture

```
src/
  lib/api/          typed fetch client (JWT + auto-refresh) and endpoint modules
  lib/auth-store.ts real auth (replaces previous mock); useAuth(), authStore.login/register/logout
  routes/           TanStack Start file-based routes
  components/       UI + shadcn
server/
  src/models/       Mongoose schemas (User, Business, Sale, Expense, InventoryItem, Employee, Notification, RefreshToken)
  src/routes/       REST endpoints under /api/*
  src/middleware/   auth (JWT), requireRole, validate (zod), error
  src/services/     notifications, seed
```

## Auth flow

1. `POST /api/auth/register` or `/login` returns `{ user, accessToken, refreshToken }`.
2. Frontend stores both in `localStorage` (`nexora.access`, `nexora.refresh`).
3. Every API call attaches `Authorization: Bearer <access>`.
4. On 401, the client transparently calls `/api/auth/refresh` (rotating refresh tokens; old `jti` is revoked) and retries the original request once.
5. Refresh tokens auto-expire via a MongoDB TTL index.

## Roles

- **admin** — full access (default on register)
- **manager** — can create/update employees
- **admin only** — can delete employees

Roles are enforced server-side in `requireRole` middleware. Use `useRole()` / `hasRole(...)` on the client for conditional UI.

## Inventory + smart notifications

- `POST /api/sales` with an `inventoryItemId` decrements stock atomically (`findOneAndUpdate` with `qty: { $gte: quantity }`). Insufficient stock returns **409**.
- When the resulting `qty` drops to or below `threshold`, a low-stock notification is created.
- Expenses ≥ 50,000 INR create a high-expense notification.
- The notifications bell polls `/api/notifications`.

## Security

- Bcrypt (12 rounds) password hashing
- Refresh-token rotation + revocation list
- Helmet, CORS allowlist
- Zod validation on every request body, query, and param
- All queries scoped by `ownerId` (no IDOR)
- **No rate limiting** on the API — add `express-rate-limit` yourself (the platform's note explicitly omits it from defaults)

## What's wired vs. ready-to-wire

✅ **Wired today**: register, login, logout, JWT refresh, protected `/app/*`, businesses/sales/expenses/inventory/employees/notifications/dashboard endpoints, seeding on first register.

🔧 **Ready to wire (one or two pages each)**: the existing Sales / Expenses / Inventory / Employees pages still read from `src/lib/mock-data.ts`. Swap each list to `useQuery(['sales', businessId], () => salesApi.list({ businessId }))` and add a create dialog using the existing shadcn `Dialog`. The API + types are already in `src/lib/api/endpoints.ts`.

## Scripts

```
bun dev          # frontend dev server
bun run build    # frontend production build
cd server && npm run dev   # API dev server
```
