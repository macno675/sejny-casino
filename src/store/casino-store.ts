"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  STARTING_COINS,
  getCard,
  rollCardDrop,
  rollChestReward,
} from "@/lib/game-data";
import type {
  ChestReward,
  InventoryItem,
  PlayerProfile,
  PlayerSettings,
  PlayerStats,
} from "@/lib/types";
import { hashPassword, levelFromXp, todayKey } from "@/lib/utils";

const defaultSettings = (displayName: string): PlayerSettings => ({
  sound: true,
  haptics: true,
  reducedMotion: false,
  winToasts: true,
  publicOnLeaderboard: true,
  avatarId: "jade",
  displayName,
});

const defaultStats = (): PlayerStats => ({
  gamesPlayed: 0,
  totalWon: 0,
  biggestWin: 0,
});

function normalizePlayer(raw: PlayerProfile): PlayerProfile {
  return {
    ...raw,
    settings: {
      ...defaultSettings(raw.displayName),
      ...(raw.settings ?? {}),
      displayName: raw.settings?.displayName || raw.displayName,
    },
    stats: { ...defaultStats(), ...(raw.stats ?? {}) },
    inventory: raw.inventory ?? [],
    ownedCardIds: raw.ownedCardIds ?? [],
  };
}

export type CasinoState = {
  accounts: Record<string, PlayerProfile>;
  sessionUser: string | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  register: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  currentPlayer: () => PlayerProfile | null;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  grantCard: (cardId: string, source: string) => boolean;
  updateSettings: (patch: Partial<PlayerSettings>) => void;
  changePassword: (
    current: string,
    next: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  openChest: () =>
    | { ok: true; reward: ChestReward; streak: number; doubled: boolean }
    | { ok: false; error: string };
  settleBet: (opts: {
    bet: number;
    payout: number;
    xp?: number;
    dropChance?: number;
  }) => { cardId: string | null; net: number };
};

function makeStarter(
  username: string,
  passwordHash: string,
  displayName: string,
): PlayerProfile {
  const name = displayName.trim() || username;
  return {
    username: username.toLowerCase(),
    passwordHash,
    displayName: name,
    coins: STARTING_COINS,
    xp: 0,
    level: 1,
    inventory: [
      {
        id: `sejny-crest-${Date.now()}`,
        cardId: "sejny-crest",
        obtainedAt: new Date().toISOString(),
        source: "Welcome gift",
      },
    ],
    ownedCardIds: ["sejny-crest"],
    lastDailyClaim: null,
    dailyStreak: 0,
    createdAt: new Date().toISOString(),
    settings: defaultSettings(name),
    stats: defaultStats(),
  };
}

function mutatePlayer(
  state: CasinoState,
  updater: (player: PlayerProfile) => PlayerProfile,
): Partial<CasinoState> {
  if (!state.sessionUser) return {};
  const key = state.sessionUser;
  const player = state.accounts[key];
  if (!player) return {};
  // Keep a single normalized shape without re-cloning on every read path.
  const base =
    player.settings && player.stats ? player : normalizePlayer(player);
  return {
    accounts: {
      ...state.accounts,
      [key]: updater(base),
    },
  };
}

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => ({
      accounts: {},
      sessionUser: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      currentPlayer: () => {
        const { sessionUser, accounts } = get();
        if (!sessionUser) return null;
        return accounts[sessionUser] ?? null;
      },

      register: async (username, password, displayName) => {
        const key = username.trim().toLowerCase();
        if (key.length < 3)
          return { ok: false, error: "Username needs at least 3 characters." };
        if (password.length < 4)
          return { ok: false, error: "Password needs at least 4 characters." };
        if (get().accounts[key])
          return { ok: false, error: "That username is already taken." };

        const passwordHash = await hashPassword(password);
        const profile = makeStarter(key, passwordHash, displayName);
        set((state) => ({
          accounts: { ...state.accounts, [key]: profile },
          sessionUser: key,
        }));
        return { ok: true };
      },

      login: async (username, password) => {
        const key = username.trim().toLowerCase();
        const account = get().accounts[key];
        if (!account)
          return { ok: false, error: "No account found for that username." };
        const passwordHash = await hashPassword(password);
        if (passwordHash !== account.passwordHash) {
          return { ok: false, error: "Incorrect password." };
        }
        set({ sessionUser: key });
        return { ok: true };
      },

      logout: () => set({ sessionUser: null }),

      addCoins: (amount) =>
        set((state) =>
          mutatePlayer(state, (player) => ({
            ...player,
            coins: player.coins + amount,
          })),
        ),

      spendCoins: (amount) => {
        const player = get().currentPlayer();
        if (!player || player.coins < amount) return false;
        set((state) =>
          mutatePlayer(state, (p) => ({ ...p, coins: p.coins - amount })),
        );
        return true;
      },

      addXp: (amount) =>
        set((state) =>
          mutatePlayer(state, (player) => {
            const xp = player.xp + amount;
            return { ...player, xp, level: levelFromXp(xp) };
          }),
        ),

      grantCard: (cardId, source) => {
        if (!getCard(cardId)) return false;
        let granted = false;
        set((state) =>
          mutatePlayer(state, (player) => {
            if (player.ownedCardIds.includes(cardId)) {
              return { ...player, coins: player.coins + 180 };
            }
            granted = true;
            const item: InventoryItem = {
              id: `${cardId}-${Date.now()}`,
              cardId,
              obtainedAt: new Date().toISOString(),
              source,
            };
            return {
              ...player,
              ownedCardIds: [...player.ownedCardIds, cardId],
              inventory: [item, ...player.inventory],
            };
          }),
        );
        return granted;
      },

      updateSettings: (patch) =>
        set((state) =>
          mutatePlayer(state, (player) => {
            const settings = { ...player.settings, ...patch };
            return {
              ...player,
              settings,
              displayName: settings.displayName.trim() || player.displayName,
            };
          }),
        ),

      changePassword: async (current, next) => {
        const player = get().currentPlayer();
        if (!player) return { ok: false, error: "Not signed in." };
        if (next.length < 4)
          return { ok: false, error: "New password needs at least 4 characters." };
        const currentHash = await hashPassword(current);
        if (currentHash !== player.passwordHash) {
          return { ok: false, error: "Current password is incorrect." };
        }
        const passwordHash = await hashPassword(next);
        set((state) => mutatePlayer(state, (p) => ({ ...p, passwordHash })));
        return { ok: true };
      },

      openChest: () => {
        const player = get().currentPlayer();
        if (!player) return { ok: false, error: "Sign in to open the chest." };

        const today = todayKey();
        if (player.lastDailyClaim === today) {
          return { ok: false, error: "Chest already opened today." };
        }

        const yesterday = todayKey(new Date(Date.now() - 86400000));
        const streak =
          player.lastDailyClaim === yesterday ? player.dailyStreak + 1 : 1;

        let reward = rollChestReward(streak);
        const hasAmber = player.ownedCardIds.includes("amber-chip");
        if (
          (reward.kind === "coins" || reward.kind === "jackpot") &&
          hasAmber
        ) {
          reward = { ...reward, amount: reward.amount + 80 };
        }

        const canDouble =
          player.ownedCardIds.includes("midnight-suite") && Math.random() < 0.2;
        let doubled = false;
        if (
          canDouble &&
          (reward.kind === "coins" ||
            reward.kind === "jackpot" ||
            reward.kind === "xp")
        ) {
          reward = { ...reward, amount: reward.amount * 2 };
          doubled = true;
        }

        set((state) =>
          mutatePlayer(state, (p) => {
            let coins = p.coins;
            let xp = p.xp;
            if (reward.kind === "coins" || reward.kind === "jackpot") {
              coins += reward.amount;
            }
            if (reward.kind === "xp") {
              xp += reward.amount;
            }
            xp += 35 + streak * 8;
            return {
              ...p,
              coins,
              xp,
              level: levelFromXp(xp),
              lastDailyClaim: today,
              dailyStreak: streak,
            };
          }),
        );

        if (reward.kind === "card") {
          get().grantCard(reward.cardId, "Daily chest");
        }

        return { ok: true, reward, streak, doubled };
      },

      settleBet: ({ bet, payout, xp = 15, dropChance = 0.1 }) => {
        let net = payout - bet;
        set((state) =>
          mutatePlayer(state, (player) => {
            const hasSovereign = player.ownedCardIds.includes("sejny-sovereign");
            const winAmount = Math.max(0, payout - bet);
            const winBonus =
              winAmount > 0 && hasSovereign
                ? Math.floor(winAmount * 0.15)
                : 0;
            net = payout - bet + winBonus;
            const coins = player.coins - bet + payout + winBonus;
            const hasCroupier = player.ownedCardIds.includes("gold-croupier");
            const gainedXp = Math.floor(xp * (hasCroupier ? 1.1 : 1));
            const nextXp = player.xp + gainedXp;
            const won = Math.max(0, payout + winBonus - bet);
            return {
              ...player,
              coins,
              xp: nextXp,
              level: levelFromXp(nextXp),
              stats: {
                gamesPlayed: player.stats.gamesPlayed + 1,
                totalWon: player.stats.totalWon + won,
                biggestWin: Math.max(player.stats.biggestWin, won),
              },
            };
          }),
        );

        const cardId = payout > bet ? rollCardDrop(dropChance) : null;
        if (cardId) get().grantCard(cardId, "Game drop");
        return { cardId, net };
      },
    }),
    {
      name: "sejny-casino-v2",
      partialize: (state) => ({
        accounts: state.accounts,
        sessionUser: state.sessionUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          queueMicrotask(() =>
            useCasinoStore.setState({ hydrated: true }),
          );
          return;
        }
        try {
          const legacy = localStorage.getItem("sejny-casino-v1");
          if (legacy && Object.keys(state.accounts).length === 0) {
            const parsed = JSON.parse(legacy) as {
              state?: {
                accounts?: Record<string, PlayerProfile>;
                sessionUser?: string | null;
              };
            };
            if (parsed.state?.accounts) {
              state.accounts = parsed.state.accounts;
              state.sessionUser = parsed.state.sessionUser ?? null;
            }
          }
        } catch {
          /* ignore legacy parse errors */
        }
        const accounts: Record<string, PlayerProfile> = {};
        for (const [key, value] of Object.entries(state.accounts)) {
          accounts[key] = normalizePlayer(value as PlayerProfile);
        }
        state.accounts = accounts;
        state.hydrated = true;
      },
    },
  ),
);

if (typeof window !== "undefined") {
  const markHydrated = () => {
    if (!useCasinoStore.getState().hydrated) {
      useCasinoStore.setState({ hydrated: true });
    }
  };
  useCasinoStore.persist.onFinishHydration(markHydrated);
  if (useCasinoStore.persist.hasHydrated()) markHydrated();
}

/** Stable reference — never clone inside selectors (avoids update loops). */
export function selectPlayer(state: CasinoState) {
  if (!state.sessionUser) return null;
  return state.accounts[state.sessionUser] ?? null;
}

export function selectAccounts(state: CasinoState) {
  return state.accounts;
}

export function buildLeaderboard(accounts: Record<string, PlayerProfile>) {
  return Object.values(accounts)
    .filter((p) => p.settings?.publicOnLeaderboard !== false)
    .sort((a, b) => b.coins - a.coins || b.level - a.level || b.xp - a.xp)
    .slice(0, 20);
}
