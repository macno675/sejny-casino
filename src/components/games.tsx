"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GAMES } from "@/lib/game-data";
import { useCasinoStore, selectPlayer } from "@/store/casino-store";
import { Button, Panel } from "@/components/ui";
import { formatCoins } from "@/lib/utils";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "◆", "☾"];

function sleep(ms: number, reduced?: boolean) {
  return new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 180) : ms));
}

export function SlotsGame() {
  const meta = GAMES[0]!;
  const player = useCasinoStore(selectPlayer);
  const settleBet = useCasinoStore((s) => s.settleBet);
  const reduced = player?.settings.reducedMotion;
  const [bet, setBet] = useState(meta.minBet);
  const [reels, setReels] = useState(["★", "◆", "☾"]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("Ease into the spin — luck likes patience.");
  const [flash, setFlash] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);

  const hasCrest = player?.ownedCardIds.includes("sejny-crest");

  async function spin() {
    if (!player || spinning) return;
    if (player.coins < bet) {
      setMessage("Not enough coins.");
      return;
    }
    setSpinning(true);
    setDrop(null);
    setFlash(false);

    for (let i = 0; i < 18; i++) {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
      ]);
      await sleep(90 + i * 28, reduced);
    }

    const final = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
    ];
    setReels(final);
    await sleep(350, reduced);

    let mult = 0;
    if (final[0] === final[1] && final[1] === final[2]) {
      mult = final[0] === "★" ? 12 : 6;
    } else if (
      final[0] === final[1] ||
      final[1] === final[2] ||
      final[0] === final[2]
    ) {
      mult = 2;
    }

    if (hasCrest && mult > 0) mult *= 1.02;
    const payout = Math.floor(bet * mult);
    const result = settleBet({
      bet,
      payout,
      xp: 12 + Math.floor(mult * 4),
      dropChance: 0.14,
    });
    setDrop(result.cardId);
    if (mult > 0) setFlash(true);
    setMessage(
      mult > 0
        ? `Won ${formatCoins(payout)} coins`
        : "No match — the lake stays still.",
    );
    setSpinning(false);
  }

  return (
    <GameFrame
      title={meta.name}
      blurb={meta.blurb}
      bet={bet}
      setBet={setBet}
      min={meta.minBet}
      max={meta.maxBet}
    >
      <div className="relative mx-auto grid max-w-lg grid-cols-3 gap-3">
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle,rgba(245,197,66,0.35),transparent_70%)]"
          />
        )}
        {reels.map((symbol, i) => (
          <motion.div
            key={`${symbol}-${i}-${spinning}`}
            initial={{ y: -28, opacity: 0.35, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex aspect-square items-center justify-center rounded-3xl border border-white/10 bg-black/40 text-5xl text-[var(--gold)] shadow-[inset_0_0_40px_rgba(245,197,66,0.08)]"
          >
            {symbol}
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button variant="neon" disabled={spinning} onClick={spin}>
          {spinning ? "Spinning…" : "Spin reels"}
        </Button>
        <p className="text-sm text-[var(--muted)]">{message}</p>
        <AnimatePresence>
          {drop && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[var(--magenta)]"
            >
              Card drop — open your inventory
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </GameFrame>
  );
}

export function RouletteGame() {
  const meta = GAMES[1]!;
  const player = useCasinoStore(selectPlayer);
  const settleBet = useCasinoStore((s) => s.settleBet);
  const reduced = player?.settings.reducedMotion;
  const [bet, setBet] = useState(meta.minBet);
  const [pick, setPick] = useState<"red" | "black" | "green">("red");
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [turns, setTurns] = useState(0);
  const [message, setMessage] = useState(
    "Choose a color. The wheel takes its time.",
  );

  const colorOf = (n: number) =>
    n === 0 ? "green" : n % 2 === 0 ? "black" : "red";

  async function spin() {
    if (!player || spinning) return;
    if (player.coins < bet) {
      setMessage("Not enough coins.");
      return;
    }
    setSpinning(true);
    const landed = Math.floor(Math.random() * 37);
    setTurns((t) => t + 4);
    await sleep(2600, reduced);
    setResult(landed);
    const color = colorOf(landed);
    const hasPass = player.ownedCardIds.includes("border-pass");
    let payout = 0;
    if (pick === color) {
      const base = color === "green" ? 14 : 2;
      const bonus = hasPass && color !== "green" ? 1.05 : 1;
      payout = Math.floor(bet * base * bonus);
    }
    settleBet({ bet, payout, xp: 18, dropChance: 0.11 });
    setMessage(
      payout > 0
        ? `${landed} ${color.toUpperCase()} — +${formatCoins(payout)}`
        : `${landed} ${color.toUpperCase()} — house keeps the stake`,
    );
    setSpinning(false);
  }

  return (
    <GameFrame
      title={meta.name}
      blurb={meta.blurb}
      bet={bet}
      setBet={setBet}
      min={meta.minBet}
      max={meta.maxBet}
    >
      <div className="mx-auto flex max-w-sm flex-col items-center gap-8">
        <motion.div
          animate={{ rotate: turns * 360 + (result ?? 0) * 9.7 }}
          transition={{ duration: spinning ? 2.6 : 0.8, ease: [0.12, 0.8, 0.2, 1] }}
          className="relative flex h-52 w-52 items-center justify-center rounded-full border-[10px] border-[var(--gold)] bg-[conic-gradient(#ff5d7a_0_10deg,#0c1020_10deg_20deg,#ff5d7a_20deg_30deg,#0c1020_30deg_40deg,#2dd4a8_40deg_50deg,#ff5d7a_50deg_60deg,#0c1020_60deg_360deg)] shadow-[0_0_50px_rgba(245,197,66,0.25)]"
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/15 bg-black/80 text-center backdrop-blur-md">
            <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--gold)]">
              {result ?? "?"}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
              ball
            </span>
          </div>
        </motion.div>
        <div className="flex gap-2">
          {(["red", "black", "green"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setPick(c)}
              className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                pick === c ? "ring-2 ring-white/70 scale-105" : "opacity-70"
              } ${
                c === "red"
                  ? "bg-[#ff5d7a]"
                  : c === "black"
                    ? "bg-[#121624]"
                    : "bg-[#2dd4a8] text-[#041018]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <Button variant="neon" disabled={spinning} onClick={spin}>
          {spinning ? "Wheel spinning…" : "Spin wheel"}
        </Button>
        <p className="text-center text-sm text-[var(--muted)]">{message}</p>
      </div>
    </GameFrame>
  );
}

type BJCard = { rank: string; suit: string; value: number };

function drawCard(): BJCard {
  const ranks = [
    ["A", 11],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["5", 5],
    ["6", 6],
    ["7", 7],
    ["8", 8],
    ["9", 9],
    ["10", 10],
    ["J", 10],
    ["Q", 10],
    ["K", 10],
  ] as const;
  const suits = ["♠", "♥", "♦", "♣"];
  const [rank, value] = ranks[Math.floor(Math.random() * ranks.length)]!;
  return {
    rank,
    value,
    suit: suits[Math.floor(Math.random() * suits.length)]!,
  };
}

function handTotal(cards: BJCard[]) {
  let total = cards.reduce((s, c) => s + c.value, 0);
  let aces = cards.filter((c) => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export function BlackjackGame() {
  const meta = GAMES[2]!;
  const player = useCasinoStore(selectPlayer);
  const settleBet = useCasinoStore((s) => s.settleBet);
  const reduced = player?.settings.reducedMotion;
  const [bet, setBet] = useState(meta.minBet);
  const [playerHand, setPlayerHand] = useState<BJCard[]>([]);
  const [dealerHand, setDealerHand] = useState<BJCard[]>([]);
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [message, setMessage] = useState("Cards arrive slowly. Take your time.");
  const [hidden, setHidden] = useState(true);
  const [busy, setBusy] = useState(false);

  const pTotal = useMemo(() => handTotal(playerHand), [playerHand]);
  const dTotal = useMemo(() => handTotal(dealerHand), [dealerHand]);

  async function deal() {
    if (!player || busy) return;
    if (player.coins < bet) {
      setMessage("Not enough coins.");
      return;
    }
    setBusy(true);
    setPlayerHand([]);
    setDealerHand([]);
    setHidden(true);
    setPhase("play");
    const p1 = drawCard();
    setPlayerHand([p1]);
    await sleep(420, reduced);
    const d1 = drawCard();
    setDealerHand([d1]);
    await sleep(420, reduced);
    const p2 = drawCard();
    const p = [p1, p2];
    setPlayerHand(p);
    await sleep(420, reduced);
    const d2 = drawCard();
    const d = [d1, d2];
    setDealerHand(d);
    setMessage("Hit or stand.");
    setBusy(false);
    if (handTotal(p) === 21) finish(p, d, true);
  }

  async function hit() {
    if (phase !== "play" || busy) return;
    setBusy(true);
    await sleep(380, reduced);
    const next = [...playerHand, drawCard()];
    setPlayerHand(next);
    setBusy(false);
    if (handTotal(next) > 21) finish(next, dealerHand, true);
  }

  function stand() {
    if (phase !== "play" || busy) return;
    finish(playerHand, dealerHand, false);
  }

  async function finish(pHand: BJCard[], dHand: BJCard[], force: boolean) {
    setBusy(true);
    setHidden(false);
    let dealer = [...dHand];
    if (!force || handTotal(pHand) <= 21) {
      while (handTotal(dealer) < 17) {
        await sleep(500, reduced);
        dealer = [...dealer, drawCard()];
        setDealerHand(dealer);
      }
    }

    const pt = handTotal(pHand);
    const dt = handTotal(dealer);
    let payout = 0;
    let msg = "";
    if (pt > 21) {
      msg = "Bust — dealer wins.";
    } else if (dt > 21 || pt > dt) {
      const hasAce = player?.ownedCardIds.includes("velvet-ace");
      const mult = pt === 21 && pHand.length === 2 ? 2.5 : hasAce ? 2.16 : 2;
      payout = Math.floor(bet * mult);
      msg = `You win ${formatCoins(payout)}`;
    } else if (pt === dt) {
      payout = bet;
      msg = "Push — bet returned.";
    } else {
      msg = "Dealer wins.";
    }
    settleBet({ bet, payout, xp: 20, dropChance: 0.12 });
    setMessage(msg);
    setPhase("done");
    setBusy(false);
  }

  return (
    <GameFrame
      title={meta.name}
      blurb={meta.blurb}
      bet={bet}
      setBet={setBet}
      min={meta.minBet}
      max={meta.maxBet}
    >
      <div className="space-y-8">
        <HandRow
          label="Dealer"
          cards={dealerHand}
          hideSecond={hidden && dealerHand.length > 0}
          total={hidden ? undefined : dTotal}
        />
        <HandRow
          label="You"
          cards={playerHand}
          total={playerHand.length ? pTotal : undefined}
        />
        <div className="flex flex-wrap justify-center gap-3">
          {phase === "idle" || phase === "done" ? (
            <Button variant="neon" disabled={busy} onClick={deal}>
              Deal
            </Button>
          ) : (
            <>
              <Button disabled={busy} onClick={hit}>
                Hit
              </Button>
              <Button variant="ghost" disabled={busy} onClick={stand}>
                Stand
              </Button>
            </>
          )}
        </div>
        <p className="text-center text-sm text-[var(--muted)]">{message}</p>
      </div>
    </GameFrame>
  );
}

function HandRow({
  label,
  cards,
  hideSecond,
  total,
}: {
  label: string;
  cards: BJCard[];
  hideSecond?: boolean;
  total?: number;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{label}</span>
        {total !== undefined && (
          <span className="text-[var(--cyan)]">{total}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {cards.length === 0 && (
          <div className="h-28 w-20 rounded-2xl border border-dashed border-white/15" />
        )}
        {cards.map((card, i) => (
          <motion.div
            key={`${card.rank}${card.suit}${i}`}
            initial={{ rotateY: 90, opacity: 0, y: 16 }}
            animate={{ rotateY: 0, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-28 w-20 flex-col justify-between rounded-2xl border border-white/20 bg-[#f4f1ff] p-2.5 text-[#12081a] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          >
            {hideSecond && i === 1 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-[linear-gradient(145deg,#7c6cff,#ff5d9a)] text-white">
                ?
              </div>
            ) : (
              <>
                <span className="text-sm font-bold">
                  {card.rank}
                  {card.suit}
                </span>
                <span className="self-end text-2xl">{card.suit}</span>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DiceGame() {
  const meta = GAMES[3]!;
  const player = useCasinoStore(selectPlayer);
  const settleBet = useCasinoStore((s) => s.settleBet);
  const reduced = player?.settings.reducedMotion;
  const [bet, setBet] = useState(meta.minBet);
  const [mode, setMode] = useState<"high" | "low" | "doubles">("high");
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("Call the table, then watch them settle.");

  async function roll() {
    if (!player || rolling) return;
    if (player.coins < bet) {
      setMessage("Not enough coins.");
      return;
    }
    setRolling(true);
    for (let i = 0; i < 14; i++) {
      setDice([
        1 + Math.floor(Math.random() * 6),
        1 + Math.floor(Math.random() * 6),
      ]);
      await sleep(100 + i * 20, reduced);
    }
    const a = 1 + Math.floor(Math.random() * 6);
    const b = 1 + Math.floor(Math.random() * 6);
    setDice([a, b]);
    await sleep(280, reduced);
    const sum = a + b;
    let payout = 0;
    if (mode === "doubles" && a === b) payout = bet * 6;
    if (mode === "high" && sum >= 8) payout = bet * 2;
    if (mode === "low" && sum <= 6) payout = bet * 2;
    settleBet({ bet, payout, xp: 14, dropChance: 0.1 });
    setMessage(
      payout > 0
        ? `${a}+${b}=${sum} — won ${formatCoins(payout)}`
        : `${a}+${b}=${sum} — miss`,
    );
    setRolling(false);
  }

  return (
    <GameFrame
      title={meta.name}
      blurb={meta.blurb}
      bet={bet}
      setBet={setBet}
      min={meta.minBet}
      max={meta.maxBet}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-5">
          {dice.map((d, i) => (
            <motion.div
              key={`${d}-${i}-${rolling}`}
              animate={{
                rotate: rolling ? [0, 18, -12, 8, 0] : 0,
                y: rolling ? [0, -10, 0] : 0,
              }}
              transition={{ duration: 0.55 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-[#f4f1ff] text-4xl font-bold text-[#12081a] shadow-[0_0_30px_rgba(124,108,255,0.25)]"
            >
              {d}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          {(["high", "low", "doubles"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                mode === m
                  ? "border-[var(--violet)] bg-[var(--violet)]/20 text-white"
                  : "border-white/10 text-[var(--muted)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <Button variant="neon" disabled={rolling} onClick={roll}>
          {rolling ? "Rolling…" : "Roll dice"}
        </Button>
        <p className="text-sm text-[var(--muted)]">{message}</p>
      </div>
    </GameFrame>
  );
}

function GameFrame({
  title,
  blurb,
  bet,
  setBet,
  min,
  max,
  children,
}: {
  title: string;
  blurb: string;
  bet: number;
  setBet: (n: number) => void;
  min: number;
  max: number;
  children: React.ReactNode;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="mb-6 border-b border-white/8 pb-5">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{blurb}</p>
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Bet
        </label>
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="w-44 accent-[var(--violet)]"
        />
        <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-semibold text-white">
          {formatCoins(bet)}
        </span>
      </div>
      {children}
    </Panel>
  );
}
