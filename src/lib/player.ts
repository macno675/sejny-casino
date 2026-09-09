import type { InventoryItem, User } from "@prisma/client";
import type { PlayerProfile, PlayerSettings, PlayerStats } from "@/lib/types";

export type UserWithInventory = User & { inventory: InventoryItem[] };

export function toPublicPlayer(user: UserWithInventory): PlayerProfile {
  const settings: PlayerSettings = {
    sound: user.sound,
    haptics: user.haptics,
    reducedMotion: user.reducedMotion,
    winToasts: user.winToasts,
    publicOnLeaderboard: user.publicOnLeaderboard,
    avatarId: user.avatarId,
    displayName: user.displayName,
  };

  const stats: PlayerStats = {
    gamesPlayed: user.gamesPlayed,
    totalWon: user.totalWon,
    biggestWin: user.biggestWin,
  };

  const inventory = [...user.inventory]
    .sort(
      (a, b) =>
        new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime(),
    )
    .map((item) => ({
      id: item.id,
      cardId: item.cardId,
      obtainedAt: item.obtainedAt.toISOString(),
      source: item.source,
    }));

  return {
    username: user.username,
    passwordHash: "",
    displayName: user.displayName,
    coins: user.coins,
    xp: user.xp,
    level: user.level,
    inventory,
    ownedCardIds: inventory.map((i) => i.cardId),
    lastDailyClaim: user.lastDailyClaim,
    dailyStreak: user.dailyStreak,
    createdAt: user.createdAt.toISOString(),
    settings,
    stats,
  };
}
