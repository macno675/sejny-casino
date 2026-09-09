export type CardRarity = "common" | "rare" | "epic" | "legendary";

export type CardType =
  | "Crest"
  | "Nature"
  | "Travel"
  | "Token"
  | "Ace"
  | "Staff"
  | "Suite"
  | "Crown";

export type SpecialCard = {
  id: string;
  name: string;
  rarity: CardRarity;
  type: CardType;
  description: string;
  bonus: string;
  accent: string;
  glow: string;
  image: string;
  motif: string;
};

export type InventoryItem = {
  id: string;
  cardId: string;
  obtainedAt: string;
  source: string;
};

export type PlayerSettings = {
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
  winToasts: boolean;
  publicOnLeaderboard: boolean;
  avatarId: string;
  displayName: string;
};

export type PlayerStats = {
  gamesPlayed: number;
  totalWon: number;
  biggestWin: number;
};

export type ChestReward =
  | { kind: "coins"; amount: number; label: string }
  | { kind: "xp"; amount: number; label: string }
  | { kind: "card"; cardId: string; label: string }
  | { kind: "jackpot"; amount: number; label: string };

export type PlayerProfile = {
  username: string;
  passwordHash: string;
  displayName: string;
  coins: number;
  xp: number;
  level: number;
  inventory: InventoryItem[];
  ownedCardIds: string[];
  lastDailyClaim: string | null;
  dailyStreak: number;
  createdAt: string;
  settings: PlayerSettings;
  stats: PlayerStats;
};

export type GameSlug = "slots" | "roulette" | "blackjack" | "dice";

export type GameMeta = {
  slug: GameSlug;
  name: string;
  subtitle: string;
  blurb: string;
  minBet: number;
  maxBet: number;
  accent: string;
  surface: string;
  surfaceDeep: string;
  tag: string;
  rating: number;
  motif: string;
};
