import type { ChestReward, GameMeta, SpecialCard } from "./types";

export const STARTING_COINS = 2500;

export const AVATARS = [
  { id: "ember", label: "Ember", color: "#ff6b4a" },
  { id: "aurora", label: "Aurora", color: "#7c6cff" },
  { id: "jade", label: "Jade", color: "#2dd4a8" },
  { id: "solar", label: "Solar", color: "#f5c542" },
  { id: "frost", label: "Frost", color: "#5bb8ff" },
  { id: "rose", label: "Rose", color: "#ff5d9a" },
];

export const GAMES: GameMeta[] = [
  {
    slug: "slots",
    name: "Lake Reels",
    blurb: "Slow-spin symbols, luminous cascades, rare card drops.",
    minBet: 25,
    maxBet: 500,
    accent: "#f5c542",
    tag: "Slots",
  },
  {
    slug: "roulette",
    name: "Border Wheel",
    blurb: "A long wheel spin on velvet glass — color or green.",
    minBet: 50,
    maxBet: 1000,
    accent: "#ff5d7a",
    tag: "Table",
  },
  {
    slug: "blackjack",
    name: "Table 21",
    blurb: "Cinematic dealing. Soft 17 stays. Hit with intention.",
    minBet: 50,
    maxBet: 750,
    accent: "#2dd4a8",
    tag: "Cards",
  },
  {
    slug: "dice",
    name: "Twin Dice",
    blurb: "Weighted rolls with glow trails. High, low, or doubles.",
    minBet: 20,
    maxBet: 400,
    accent: "#7c6cff",
    tag: "Dice",
  },
];

export const SPECIAL_CARDS: SpecialCard[] = [
  {
    id: "sejny-crest",
    name: "Sejny Crest",
    rarity: "common",
    type: "Crest",
    description: "Town seal pressed into luminous brass.",
    bonus: "+2% slots payout",
    accent: "#8fa88c",
    glow: "rgba(143,168,140,0.55)",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
    motif: "◈",
  },
  {
    id: "lake-mirror",
    name: "Lake Mirror",
    rarity: "common",
    type: "Nature",
    description: "Still water that bends small luck toward you.",
    bonus: "+1 daily streak shield",
    accent: "#5bb8ff",
    glow: "rgba(91,184,255,0.5)",
    image:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80",
    motif: "◎",
  },
  {
    id: "border-pass",
    name: "Border Pass",
    rarity: "rare",
    type: "Travel",
    description: "A stamped ticket between two worlds.",
    bonus: "+5% roulette color wins",
    accent: "#3d7ea6",
    glow: "rgba(61,126,166,0.55)",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80",
    motif: "⬡",
  },
  {
    id: "amber-chip",
    name: "Amber Chip",
    rarity: "rare",
    type: "Token",
    description: "Baltic resin cut into a wager token.",
    bonus: "+80 chest coin bonus",
    accent: "#f5c542",
    glow: "rgba(245,197,66,0.55)",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    motif: "◉",
  },
  {
    id: "velvet-ace",
    name: "Velvet Ace",
    rarity: "epic",
    type: "Ace",
    description: "Soft felt ace that tilts the table.",
    bonus: "+8% blackjack wins",
    accent: "#ff5d9a",
    glow: "rgba(255,93,154,0.55)",
    image:
      "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=900&q=80",
    motif: "♠",
  },
  {
    id: "gold-croupier",
    name: "Gold Croupier",
    rarity: "epic",
    type: "Staff",
    description: "House favor cast in a gilded silhouette.",
    bonus: "+10% mini-game XP",
    accent: "#e8d5a3",
    glow: "rgba(232,213,163,0.55)",
    image:
      "https://images.unsplash.com/photo-1596838132731-3301c3fd4310?auto=format&fit=crop&w=900&q=80",
    motif: "✦",
  },
  {
    id: "midnight-suite",
    name: "Midnight Suite",
    rarity: "legendary",
    type: "Suite",
    description: "Private room above the lobby, doors ajar.",
    bonus: "Chest may double once per week",
    accent: "#7c6cff",
    glow: "rgba(124,108,255,0.6)",
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
    motif: "❖",
  },
  {
    id: "sejny-sovereign",
    name: "Sejny Sovereign",
    rarity: "legendary",
    type: "Crown",
    description: "The rarest mark of the house.",
    bonus: "+15% all coin wins",
    accent: "#f0c14a",
    glow: "rgba(240,193,74,0.65)",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=80",
    motif: "♛",
  },
];

export function getCard(id: string) {
  return SPECIAL_CARDS.find((c) => c.id === id);
}

export function rarityWeight(rarity: SpecialCard["rarity"]) {
  switch (rarity) {
    case "common":
      return 50;
    case "rare":
      return 28;
    case "epic":
      return 16;
    case "legendary":
      return 6;
  }
}

export function rollCardDrop(chance = 0.12): string | null {
  if (Math.random() > chance) return null;
  const pool = SPECIAL_CARDS.flatMap((card) =>
    Array.from({ length: rarityWeight(card.rarity) }, () => card.id),
  );
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

type LootEntry = { weight: number; build: (streak: number) => ChestReward };

const CHEST_POOL: LootEntry[] = [
  {
    weight: 34,
    build: (streak) => {
      const amount = 180 + streak * 40 + Math.floor(Math.random() * 120);
      return { kind: "coins", amount, label: `${amount} coins` };
    },
  },
  {
    weight: 22,
    build: (streak) => {
      const amount = 320 + streak * 55 + Math.floor(Math.random() * 220);
      return { kind: "coins", amount, label: `${amount} coin pouch` };
    },
  },
  {
    weight: 18,
    build: (streak) => {
      const amount = 60 + streak * 12;
      return { kind: "xp", amount, label: `${amount} XP spark` };
    },
  },
  {
    weight: 16,
    build: () => {
      const cardId = rollCardDrop(1)!;
      const card = getCard(cardId)!;
      return { kind: "card", cardId, label: card.name };
    },
  },
  {
    weight: 10,
    build: (streak) => {
      const amount = 900 + streak * 100 + Math.floor(Math.random() * 600);
      return { kind: "jackpot", amount, label: `${amount} jackpot burst` };
    },
  },
];

export function rollChestReward(streak: number): ChestReward {
  const total = CHEST_POOL.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of CHEST_POOL) {
    roll -= entry.weight;
    if (roll <= 0) return entry.build(streak);
  }
  return CHEST_POOL[0]!.build(streak);
}

export function msUntilNextClaim(lastDailyClaim: string | null) {
  if (!lastDailyClaim) return 0;
  const [y, m, d] = lastDailyClaim.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const next = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - Date.now());
}
