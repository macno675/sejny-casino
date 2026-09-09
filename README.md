# Sejny Casino

Modern industrial dark-gaming casino: daily case opening, 3D collectible cards, polished tables, leaderboard, account settings.

## Design

See **[DESIGN.md](./DESIGN.md)** for palette, typography, motion, and UI rules.

## Stack

- Next.js App Router
- Prisma + Postgres (Supabase pooler)
- Zustand (client cache) + HTTP cookie sessions

## Setup

```bash
cp .env.example .env.local
# fill DATABASE_URL, DIRECT_URL, AUTH_SECRET

npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database scripts

```bash
npm run db:push      # sync schema (dev)
npm run db:generate  # prisma generate
npm run db:studio    # Prisma Studio
```

## Deploy on Vercel

1. Import `macno675/sejny-casino` on Vercel.
2. Set env vars for **Production** and **Preview**:
   - `DATABASE_URL` — Supabase **transaction** pooler (`:6543`) with `?pgbouncer=true&connection_limit=1`
   - `DIRECT_URL` — Supabase **session** pooler (`:5432`)
   - `AUTH_SECRET` — long random string (required for login cookies)
3. Redeploy after saving env vars.
4. If `/api/auth/register` returns 500, open Vercel → Deployment → Logs; the API now returns the error message as JSON.

## Features

- Auth + player progress in Postgres
- Daily case spinner, inventory cards, games, leaderboard, account settings
