"use client";

import { create } from "zustand";
import type { ChestReward, PlayerProfile, PlayerSettings } from "@/lib/types";

type ApiResult<T> = T & { ok: boolean; error?: string };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      return {
        ok: false,
        error: `Server returned non-JSON (${res.status}). Check Vercel env: DATABASE_URL, DIRECT_URL, AUTH_SECRET.`,
      } as T;
    }
  } else {
    return {
      ok: false,
      error: `Empty server response (${res.status}). Check Vercel logs and env vars.`,
    } as T;
  }

  return data as T;
}

export type CasinoState = {
  player: PlayerProfile | null;
  leaderboard: PlayerProfile[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
  register: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  updateSettings: (patch: Partial<PlayerSettings>) => Promise<void>;
  changePassword: (
    current: string,
    next: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  openChest: () => Promise<
    | { ok: true; reward: ChestReward; streak: number; doubled: boolean }
    | { ok: false; error: string }
  >;
  settleBet: (opts: {
    bet: number;
    payout: number;
    xp?: number;
    dropChance?: number;
  }) => Promise<{ cardId: string | null; net: number }>;
};

export const useCasinoStore = create<CasinoState>((set) => ({
  player: null,
  leaderboard: [],
  hydrated: false,
  setHydrated: (value) => set({ hydrated: value }),

  bootstrap: async () => {
    try {
      const me = await api<{ ok: boolean; player: PlayerProfile | null }>(
        "/api/me",
      );
      set({ player: me.ok ? me.player : null });
    } catch {
      set({ player: null });
    } finally {
      set({ hydrated: true });
    }
  },

  refreshMe: async () => {
    const me = await api<{ ok: boolean; player: PlayerProfile | null }>(
      "/api/me",
    );
    set({ player: me.ok ? me.player : null });
  },

  refreshLeaderboard: async () => {
    const data = await api<{ ok: boolean; rows: PlayerProfile[] }>(
      "/api/leaderboard",
    );
    if (data.ok) set({ leaderboard: data.rows });
  },

  register: async (username, password, displayName) => {
    const data = await api<
      ApiResult<{ player?: PlayerProfile; error?: string }>
    >("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, displayName }),
    });
    if (!data.ok || !data.player) {
      return { ok: false, error: data.error ?? "Could not register." };
    }
    set({ player: data.player });
    return { ok: true };
  },

  login: async (username, password) => {
    const data = await api<
      ApiResult<{ player?: PlayerProfile; error?: string }>
    >("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!data.ok || !data.player) {
      return { ok: false, error: data.error ?? "Could not sign in." };
    }
    set({ player: data.player });
    return { ok: true };
  },

  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    set({ player: null });
  },

  updateSettings: async (patch) => {
    const data = await api<
      ApiResult<{ player?: PlayerProfile; error?: string }>
    >("/api/me/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (data.ok && data.player) set({ player: data.player });
  },

  changePassword: async (current, next) => {
    const data = await api<ApiResult<{ error?: string }>>(
      "/api/me/password",
      {
        method: "POST",
        body: JSON.stringify({ current, next }),
      },
    );
    if (!data.ok) return { ok: false, error: data.error ?? "Could not update." };
    return { ok: true };
  },

  openChest: async () => {
    const data = await api<
      ApiResult<{
        reward?: ChestReward;
        streak?: number;
        doubled?: boolean;
        player?: PlayerProfile;
        error?: string;
      }>
    >("/api/chest/open", { method: "POST" });
    if (!data.ok || !data.reward || data.streak === undefined) {
      return { ok: false, error: data.error ?? "Could not open chest." };
    }
    if (data.player) set({ player: data.player });
    return {
      ok: true,
      reward: data.reward,
      streak: data.streak,
      doubled: Boolean(data.doubled),
    };
  },

  settleBet: async ({ bet, payout, xp, dropChance }) => {
    const data = await api<
      ApiResult<{
        cardId?: string | null;
        net?: number;
        player?: PlayerProfile;
        error?: string;
      }>
    >("/api/game/settle", {
      method: "POST",
      body: JSON.stringify({ bet, payout, xp, dropChance }),
    });
    if (data.player) set({ player: data.player });
    if (!data.ok) {
      return { cardId: null, net: -bet };
    }
    return {
      cardId: data.cardId ?? null,
      net: data.net ?? 0,
    };
  },
}));

export function selectPlayer(state: CasinoState) {
  return state.player;
}
