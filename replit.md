# Skilnex

An online learning platform (formerly Byonsoft) offering courses, AI career mentoring, and subscription management for students.

## Run & Operate

- `cd byonsoft_extracted/Byonsoft && npm run dev` — start the full app (port 5000, dev mode)
- `cd byonsoft_extracted/Byonsoft && npm run db:push` — push DB schema changes to Neon
- `cd byonsoft_extracted/Byonsoft && npm run build` — production build
- `cd byonsoft_extracted/Byonsoft && npm run start` — start production build

The **"Skilnex App"** workflow runs `npm run dev` automatically on startup.

## Stack

- Frontend: React + TypeScript + Tailwind CSS + Vite
- Backend: Node.js + Express + TypeScript (`tsx` for dev, `esbuild` for prod)
- Database: Neon PostgreSQL + Drizzle ORM
- AI: Groq API (`llama-3.3-70b-versatile`)
- Auth: JWT + bcrypt
- Routing: wouter (client-side)

## Where things live

- App root: `byonsoft_extracted/Byonsoft/`
- Server entry: `server/index.ts`
- Frontend entry: `client/src/main.tsx`
- DB schema: `shared/schema.ts`
- Groq AI: `server/groq.ts`
- API routes: `server/routes.ts`

## Environment Variables / Secrets

All secrets are stored in Replit Secrets (never hardcoded):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `GROQ_KEYS` — comma-separated Groq API keys (rotates on rate limit)
- `SESSION_SECRET` — JWT/session signing secret
- `NODE_ENV` — set to `development` (env var)
- `PORT` — set to `5000` (env var)

## Default Admin Account

- Email: `admin@byonsoft.com`
- Password: `password`
- Role: admin (auto-seeded on first run)

## Architecture decisions

- Server handles both API and frontend (Vite dev server in dev, static files in prod)
- Groq key rotation: automatically cycles keys on 429/503 errors
- DB seeding runs on every startup via `seedDatabase()` using `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` guards
- `app_settings` table stores global config (subscription price, referral settings)

## Fixes Applied

1. Removed `reusePort: true` from `httpServer.listen()` — caused startup error on Linux
2. Moved `ALTER TABLE app_settings` statements to before the 4-column INSERT — prevents "column does not exist" seed error

## User preferences

- App name is Skilnex (code still references Byonsoft internally)
- Groq model: `llama-3.3-70b-versatile`

## Gotchas

- Always run `db:push` from `byonsoft_extracted/Byonsoft/` — the drizzle config is there
- Production build requires `npm run build` first, then `npm run start`
