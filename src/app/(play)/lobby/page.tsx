"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Gift, Sparkles } from "lucide-react";
import { GAMES } from "@/lib/game-data";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";
import { todayKey } from "@/lib/utils";
import { Panel } from "@/components/ui";
import { GameBox } from "@/components/game-box";

export default function LobbyPage() {
  const player = useCasinoStore(selectPlayer);
  if (!player) return null;

  const canClaim = player.lastDailyClaim !== todayKey();

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass relative overflow-hidden rounded-[2rem] p-7 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(124,108,255,0.45),transparent_70%)]" />
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Good evening, {player.displayName}
          </p>
          <h1 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-4xl font-bold text-white sm:text-5xl">
            The lobby is glowing
          </h1>
          <p className="mt-4 max-w-md text-[var(--muted)]">
            Pick a table, open today&apos;s chest, or flip through the cards
            you already own.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/rewards"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,#2dd4a8,#5bb8ff)] px-5 py-2.5 text-sm font-semibold text-[#041018]"
            >
              <Gift className="h-4 w-4" />
              Daily chest
            </Link>
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white"
            >
              <Sparkles className="h-4 w-4 text-[var(--gold)]" />
              My cards
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Panel className="h-full bg-[linear-gradient(160deg,rgba(255,93,154,0.16),rgba(12,16,32,0.7))]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Tonight
            </p>
            <div className="mt-4 space-y-4">
              <StatRow label="Level" value={`Lv ${player.level}`} />
              <StatRow label="Cards owned" value={String(player.ownedCardIds.length)} />
              <StatRow label="Streak" value={`${player.dailyStreak}d`} />
              <StatRow
                label="Chest"
                value={canClaim ? "Ready" : "Opened"}
                highlight={canClaim}
              />
            </div>
          </Panel>
        </motion.div>
      </section>

      {canClaim && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/rewards">
            <Panel className="flex items-center justify-between gap-4 border-[var(--gold)]/30 transition hover:border-[var(--gold)]/55">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--gold)]/20 text-[var(--gold)]">
                  <Gift className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">Daily chest is ready</p>
                  <p className="text-sm text-[var(--muted)]">
                    Draw coins, XP, or a collectible
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[var(--gold)]" />
            </Panel>
          </Link>
        </motion.div>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Mini games
          </h2>
          <Link href="/leaderboard" className="text-sm text-[var(--violet)]">
            Leaderboard
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {GAMES.map((game, index) => (
            <GameBox key={game.slug} game={game} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-[var(--cyan)]" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
