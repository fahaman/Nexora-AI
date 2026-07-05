# Nexora API

Node + Express + Mongoose backend for the Nexora AI frontend.

## Stack

- Node 20
- Express 4
- Mongoose 8 (MongoDB)
- JWT (access + rotating refresh)
- bcryptjs, helmet, zod, cors

## Quick start

```bash
cd server
cp .env.example .env
# edit MONGO_URI, JWT_*_SECRET, CORS_ORIGIN
npm install
npm run dev
```

API listens on `http://localhost:4000` and serves under `/api/*`.

## Environment

| Var | Default | Notes |
|-----|---------|-------|
| `PORT` | 4000 | |
| `MONGO_URI` | mongodb://localhost:27017/nexora | MongoDB Atlas URI in prod |
| `JWT_ACCESS_SECRET` | — | required, long random string |
| `JWT_REFRESH_SECRET` | — | required, distinct from above |
| `ACCESS_TOKEN_TTL` | 15m | jsonwebtoken format |
| `REFRESH_TOKEN_TTL_DAYS` | 7 | rotated on each refresh |
| `CORS_ORIGIN` | http://localhost:5173 | comma-separated allowlist |
| `SEED_ON_REGISTER` | true | seeds 4 demo businesses + sample data per new user |

## Routes

```
POST  /api/auth/register      { email, password, name }
POST  /api/auth/login         { email, password }
POST  /api/auth/refresh       { refreshToken }
POST  /api/auth/logout        { refreshToken }
GET   /api/auth/me            (bearer)

GET   /api/dashboard?businessId=
GET   /api/businesses
POST  /api/businesses
PUT   /api/businesses/:id
DELETE /api/businesses/:id

GET   /api/sales?businessId=&q=&page=&pageSize=
POST  /api/sales              decrements stock atomically; 409 if insufficient
DELETE /api/sales/:id

GET   /api/expenses
POST  /api/expenses           triggers high-expense notification if >= 50000
DELETE /api/expenses/:id

GET   /api/inventory?low=true
POST  /api/inventory
PUT   /api/inventory/:id
DELETE /api/inventory/:id

GET   /api/employees
POST  /api/employees          requires role: admin|manager
PUT   /api/employees/:id
DELETE /api/employees/:id     requires role: admin

GET   /api/notifications
POST  /api/notifications/read-all
```

All non-auth routes require `Authorization: Bearer <accessToken>`.

## Deploy

- **Render** (recommended free tier): create a Web Service from this `server/` folder, set env vars, build `npm install && npm run build`, start `npm start`.
- **Railway / Fly.io**: same shape.
- **MongoDB Atlas** free tier works fine for the database.

After deploy, set `VITE_API_URL=https://your-api.onrender.com` in the Lovable frontend's Build Secrets.

## Security notes

- Passwords hashed with bcrypt (12 rounds).
- Refresh tokens stored in Mongo with `jti`, rotated on use, auto-expire via TTL index.
- All inputs validated with zod.
- Helmet enabled; CORS allowlist via env.
- **Rate limiting is not included** — add `express-rate-limit` if needed:
  ```ts
  import rateLimit from "express-rate-limit";
  app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 20 }));
  ```
