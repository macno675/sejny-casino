"use client";

import { use } from "react";
import Link from "next/link";
import {
  BlackjackGame,
  DiceGame,
  RouletteGame,
  SlotsGame,
} from "@/components/games";
import type { GameSlug } from "@/lib/types";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const game = (() => {
    switch (slug as GameSlug) {
      case "slots":
        return <SlotsGame />;
      case "roulette":
        return <RouletteGame />;
      case "blackjack":
        return <BlackjackGame />;
      case "dice":
        return <DiceGame />;
      default:
        return null;
    }
  })();

  if (!game) {
    return (
      <div className="space-y-4">
        <p>Unknown table.</p>
        <Link href="/lobby" className="text-[var(--brass)]">
          Back to lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/lobby"
        className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--brass)]"
      >
        ← Lobby
      </Link>
      {game}
    </div>
  );
}
