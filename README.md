# Sejny Casino

Modern industrial dark-gaming casino: daily case opening, 3D collectible cards, polished tables, leaderboard, account settings.

## Design

See **[DESIGN.md](./DESIGN.md)** for palette, typography, motion, and UI rules.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (already configured as `origin`).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build` · Output: Next.js default.
5. No environment variables required (player data is browser-local).

Or from CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```

Region hint in `vercel.json`: `fra1` (Frankfurt). Change if you prefer another edge region.

## Features

- **Daily case** — CS-style horizontal spinner with center marker
- **Inventory** — owned holographic cards only
- **Games** — slower cinematic tables
- **Leaderboard** + **Account** settings

Progress persists in the browser (Zustand). External images load from Unsplash (`images.unsplash.com` allowlisted in `next.config.ts`).
