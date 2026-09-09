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
2. Set env vars (Production + Preview):
   - `DATABASE_URL` (transaction pooler, port 6543, `?pgbouncer=true`)
   - `DIRECT_URL` (session pooler, port 5432)
   - `AUTH_SECRET` (long random string)
3. Deploy. Build runs `prisma generate && next build`.

## Features

- Auth + player progress in Postgres
- Daily case spinner, inventory cards, games, leaderboard, account settings
