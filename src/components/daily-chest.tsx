"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import { Coins, Sparkles, Spade, Zap } from "lucide-react";
import { getCard, msUntilNextClaim, SPECIAL_CARDS } from "@/lib/game-data";
import type { ChestReward } from "@/lib/types";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";
import { cn, formatCoins, todayKey } from "@/lib/utils";
import { Button, Panel } from "@/components/ui";

const TILE_W = 118;
const TILE_GAP = 12;
const STRIDE = TILE_W + TILE_GAP;
const STRIP_LEN = 48;
const WIN_INDEX = 38;

type SpinnerTile = {
  id: string;
  kind: ChestReward["kind"] | "mystery";
  label: string;
  accent: string;
  motif: string;
};

function rewardVisual(reward: ChestReward): Omit<SpinnerTile, "id"> {
  if (reward.kind === "card") {
    const card = getCard(reward.cardId);
    return {
      kind: "card",
      label: card?.name ?? reward.label,
      accent: card?.accent ?? "#8b5cf6",
      motif: card?.motif ?? "♠",
    };
  }
  if (reward.kind === "xp") {
    return {
      kind: "xp",
      label: reward.label,
      accent: "#2dd4a8",
      motif: "⚡",
    };
  }
  if (reward.kind === "jackpot") {
    return {
      kind: "jackpot",
      label: reward.label,
      accent: "#f0c14a",
      motif: "◆",
    };
  }
  return {
    kind: "coins",
    label: reward.label,
    accent: "#f0c14a",
    motif: "◎",
  };
}

function fillerTile(i: number): SpinnerTile {
  const roll = i % 5;
  if (roll === 0) {
    return {
      id: `f-${i}`,
      kind: "coins",
      label: `${200 + (i % 7) * 50} coins`,
      accent: "#f0c14a",
      motif: "◎",
    };
  }
  if (roll === 1) {
    return {
      id: `f-${i}`,
      kind: "xp",
      label: `${40 + (i % 5) * 10} XP`,
      accent: "#2dd4a8",
      motif: "⚡",
    };
  }
  if (roll === 2) {
    return {
      id: `f-${i}`,
      kind: "jackpot",
      label: "Jackpot",
      accent: "#f0c14a",
      motif: "◆",
    };
  }
  if (roll === 3) {
    return {
      id: `f-${i}`,
      kind: "mystery",
      label: "Mystery",
      accent: "#f0c14a",
      motif: "?",
    };
  }
  const card = SPECIAL_CARDS[i % SPECIAL_CARDS.length]!;
  return {
    id: `f-${i}`,
    kind: "card",
    label: card.name,
    accent: card.accent,
    motif: card.motif,
  };
}

function buildStrip(win: ChestReward): SpinnerTile[] {
  const tiles: SpinnerTile[] = [];
  for (let i = 0; i < STRIP_LEN; i++) {
    if (i === WIN_INDEX) {
      tiles.push({ id: `win-${i}`, ...rewardVisual(win) });
    } else {
      tiles.push(fillerTile(i * 17 + win.label.length * 3));
    }
  }
  return tiles;
}

export function DailyChest() {
  const player = useCasinoStore(selectPlayer);
  const openChest = useCasinoStore((s) => s.openChest);
  const reduced = player?.settings.reducedMotion;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "reveal">("idle");
  const [reward, setReward] = useState<ChestReward | null>(null);
  const [doubled, setDoubled] = useState(false);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [strip, setStrip] = useState<SpinnerTile[]>(() =>
    Array.from({ length: 16 }, (_, i) => fillerTile(i)),
  );
  const x = useMotionValue(0);

  const claimedToday = player?.lastDailyClaim === todayKey();
  const lastClaim = player?.lastDailyClaim ?? null;
  const goldTier = (player?.dailyStreak ?? 0) >= 5;

  useEffect(() => {
    const tick = () => setRemaining(msUntilNextClaim(lastClaim));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lastClaim]);

  useEffect(() => {
    const width = viewportRef.current?.offsetWidth ?? 640;
    x.set(width / 2 - STRIDE * 3);
  }, [x]);

  const countdown = useMemo(() => {
    const total = Math.floor(remaining / 1000);
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [remaining]);

  async function open() {
    setError(null);
    const result = openChest();
    if (!result.ok) {
      setError(result.error);
      return;
    }

    const nextStrip = buildStrip(result.reward);
    setStrip(nextStrip);
    setReward(result.reward);
    setStreak(result.streak);
    setDoubled(result.doubled);
    setPhase("spinning");

    const width = viewportRef.current?.offsetWidth ?? 640;
    const center = width / 2;
    const startX = center - STRIDE * 2;
    const endX = center - (WIN_INDEX * STRIDE + TILE_W / 2);

    x.set(startX);

    await animate(x, endX, {
      duration: reduced ? 0.45 : 5.8,
      ease: [0.12, 0.75, 0.12, 1],
    }).finished;

    setPhase("reveal");
  }

  if (!player) return null;

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Daily case
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--cream)] sm:text-5xl">
          Open the chest
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          One spin per day. The strip rushes, then settles — the tile under the
          marker is your reward.
        </p>
      </div>

      <div className="case-stage px-0 pb-8 pt-6">
        <div
          ref={viewportRef}
          className="case-spinner-viewport mx-auto w-full max-w-3xl"
        >
          <div className="case-marker" aria-hidden />
          <motion.div
            className="absolute top-6 left-0 flex will-change-transform"
            style={{ x, gap: TILE_GAP }}
          >
            {strip.map((tile) => (
              <LootTile key={tile.id} tile={tile} />
            ))}
          </motion.div>
        </div>

        <div className="mx-auto mt-2 flex max-w-3xl items-end justify-center gap-10 px-6 pt-4">
          <ChestVisual
            tier="standard"
            label="Standard"
            active={!claimedToday}
            dimmed={claimedToday}
          />
          <ChestVisual
            tier="gold"
            label="Gold streak"
            active={goldTier && !claimedToday}
            dimmed={!goldTier || claimedToday}
          />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 px-6">
          <Button
            variant="claim"
            disabled={claimedToday || phase === "spinning"}
            onClick={open}
            className="min-w-[200px] uppercase tracking-[0.14em]"
          >
            {claimedToday
              ? "Opened today"
              : phase === "spinning"
                ? "Spinning…"
                : "Open case"}
          </Button>
          {claimedToday && (
            <p className="font-mono text-sm text-[var(--muted)]">
              Next case {countdown}
            </p>
          )}
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>

        <AnimatePresence>
          {phase === "reveal" && reward && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-6 max-w-md px-6 text-center"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--marker)]">
                {doubled ? "Midnight Suite doubled" : "Case result"}
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cream)]">
                {reward.label}
              </p>
              {reward.kind === "card" && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {getCard(reward.cardId)?.type} ·{" "}
                  {getCard(reward.cardId)?.rarity}
                </p>
              )}
              {(reward.kind === "coins" || reward.kind === "jackpot") && (
                <p className="mt-1 text-sm text-[var(--gold)]">
                  +{formatCoins(reward.amount)} balance
                </p>
              )}
              <p className="mt-3 text-xs text-[var(--muted)]">
                Streak day {streak}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Streak
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--cream)]">
            {player.dailyStreak}
            <span className="ml-2 text-base text-[var(--muted)]">days</span>
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            At 5+ days the Gold case lights up — same daily open, higher-tier
            look.
          </p>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Strip loot
          </p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <LootLegend
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Coin pouch"
              tone="text-[var(--gold)]"
            />
            <LootLegend
              icon={<Zap className="h-3.5 w-3.5" />}
              label="XP spark"
              tone="text-[var(--cyan)]"
            />
            <LootLegend
              icon={<Spade className="h-3.5 w-3.5" />}
              label="Collectible card"
              tone="text-[var(--magenta)]"
            />
            <LootLegend
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Jackpot burst"
              tone="text-[var(--violet)]"
            />
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function LootLegend({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
}) {
  return (
    <li className="flex items-center justify-between text-[var(--muted)]">
      <span className="flex items-center gap-2">
        <span className={tone}>{icon}</span>
        {label}
      </span>
    </li>
  );
}

function LootTile({ tile }: { tile: SpinnerTile }) {
  return (
    <div className="loot-tile" style={{ width: TILE_W }}>
      <div
        className="loot-tile-foot"
        style={{
          background: `linear-gradient(to top, ${tile.accent}99, transparent)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-2 py-3">
        <span className="text-[9px] uppercase tracking-[0.16em] text-white/45">
          {tile.kind}
        </span>
        <span
          className="text-4xl drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]"
          style={{ color: tile.accent }}
        >
          {tile.motif}
        </span>
        <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-white/85">
          {tile.label}
        </span>
      </div>
    </div>
  );
}

function ChestVisual({
  tier,
  label,
  active,
  dimmed,
}: {
  tier: "standard" | "gold";
  label: string;
  active: boolean;
  dimmed: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 transition duration-500",
        dimmed && "opacity-40 grayscale",
        active && !dimmed && "scale-105",
      )}
    >
      <motion.div
        animate={active && !dimmed ? { y: [0, -6, 0] } : { y: 0 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "chest-case",
          tier === "gold" ? "chest-case--gold" : "chest-case--standard",
        )}
      >
        <div className="chest-lid" />
        <div className="chest-lock" />
        <div
          className="chest-badge"
          style={{
            background:
              tier === "gold"
                ? "rgba(20,16,6,0.35)"
                : "rgba(240,193,74,0.15)",
            color: tier === "gold" ? "#1a1408" : "var(--gold)",
          }}
        >
          {tier === "gold" ? "★" : "S"}
        </div>
      </motion.div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
    </div>
  );
}
