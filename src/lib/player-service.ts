import { STARTING_COINS, getCard, rollCardDrop, rollChestReward } from "@/lib/game-data";
import { prisma } from "@/lib/prisma";
import { toPublicPlayer, type UserWithInventory } from "@/lib/player";
import type { ChestReward, PlayerProfile, PlayerSettings } from "@/lib/types";
import { levelFromXp, todayKey } from "@/lib/utils";

async function loadUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { inventory: true },
  });
}

export async function getPlayerById(userId: string): Promise<PlayerProfile | null> {
  const user = await loadUser(userId);
  return user ? toPublicPlayer(user) : null;
}

export async function getLeaderboard(limit = 20) {
  const rows = await prisma.user.findMany({
    where: { publicOnLeaderboard: true },
    include: { inventory: true },
    orderBy: [{ coins: "desc" }, { level: "desc" }, { xp: "desc" }],
    take: limit,
  });
  return rows.map(toPublicPlayer);
}

export async function createUser(opts: {
  username: string;
  passwordHash: string;
  displayName: string;
}) {
  const username = opts.username.trim().toLowerCase();
  const displayName = opts.displayName.trim() || username;

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: opts.passwordHash,
      displayName,
      coins: STARTING_COINS,
      inventory: {
        create: {
          cardId: "sejny-crest",
          source: "Welcome gift",
        },
      },
    },
    include: { inventory: true },
  });

  return toPublicPlayer(user);
}

async function grantCardTx(
  userId: string,
  cardId: string,
  source: string,
): Promise<boolean> {
  if (!getCard(cardId)) return false;

  const existing = await prisma.inventoryItem.findUnique({
    where: { userId_cardId: { userId, cardId } },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: 180 } },
    });
    return false;
  }

  await prisma.inventoryItem.create({
    data: { userId, cardId, source },
  });
  return true;
}

export async function updateUserSettings(
  userId: string,
  patch: Partial<PlayerSettings>,
) {
  const data: Record<string, unknown> = {};
  if (typeof patch.sound === "boolean") data.sound = patch.sound;
  if (typeof patch.haptics === "boolean") data.haptics = patch.haptics;
  if (typeof patch.reducedMotion === "boolean")
    data.reducedMotion = patch.reducedMotion;
  if (typeof patch.winToasts === "boolean") data.winToasts = patch.winToasts;
  if (typeof patch.publicOnLeaderboard === "boolean")
    data.publicOnLeaderboard = patch.publicOnLeaderboard;
  if (typeof patch.avatarId === "string") data.avatarId = patch.avatarId;
  if (typeof patch.displayName === "string" && patch.displayName.trim()) {
    data.displayName = patch.displayName.trim();
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { inventory: true },
  });
  return toPublicPlayer(user);
}

export async function changeUserPassword(
  userId: string,
  passwordHash: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function openDailyChest(userId: string): Promise<
  | {
      ok: true;
      reward: ChestReward;
      streak: number;
      doubled: boolean;
      player: PlayerProfile;
    }
  | { ok: false; error: string }
> {
  const user = await loadUser(userId);
  if (!user) return { ok: false, error: "Sign in to open the chest." };

  const today = todayKey();
  if (user.lastDailyClaim === today) {
    return { ok: false, error: "Chest already opened today." };
  }

  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const streak =
    user.lastDailyClaim === yesterday ? user.dailyStreak + 1 : 1;

  let reward = rollChestReward(streak);
  const owned = new Set(user.inventory.map((i) => i.cardId));
  const hasAmber = owned.has("amber-chip");
  if ((reward.kind === "coins" || reward.kind === "jackpot") && hasAmber) {
    reward = { ...reward, amount: reward.amount + 80 };
  }

  let doubled = false;
  if (
    owned.has("midnight-suite") &&
    Math.random() < 0.2 &&
    (reward.kind === "coins" ||
      reward.kind === "jackpot" ||
      reward.kind === "xp")
  ) {
    reward = { ...reward, amount: reward.amount * 2 };
    doubled = true;
  }

  let coins = user.coins;
  let xp = user.xp + 35 + streak * 8;
  if (reward.kind === "coins" || reward.kind === "jackpot") {
    coins += reward.amount;
  }
  if (reward.kind === "xp") {
    xp += reward.amount;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      coins,
      xp,
      level: levelFromXp(xp),
      lastDailyClaim: today,
      dailyStreak: streak,
    },
  });

  if (reward.kind === "card") {
    await grantCardTx(userId, reward.cardId, "Daily chest");
  }

  const fresh = await loadUser(userId);
  return {
    ok: true,
    reward,
    streak,
    doubled,
    player: toPublicPlayer(fresh as UserWithInventory),
  };
}

export async function settleBetForUser(
  userId: string,
  opts: { bet: number; payout: number; xp?: number; dropChance?: number },
): Promise<
  | { ok: true; cardId: string | null; net: number; player: PlayerProfile }
  | { ok: false; error: string }
> {
  const { bet, payout, xp = 15, dropChance = 0.1 } = opts;
  const user = await loadUser(userId);
  if (!user) return { ok: false, error: "Not signed in." };
  if (bet <= 0) return { ok: false, error: "Invalid bet." };
  if (user.coins < bet) return { ok: false, error: "Not enough coins." };

  const owned = new Set(user.inventory.map((i) => i.cardId));
  const winAmount = Math.max(0, payout - bet);
  const winBonus =
    winAmount > 0 && owned.has("sejny-sovereign")
      ? Math.floor(winAmount * 0.15)
      : 0;
  const net = payout - bet + winBonus;
  const coins = user.coins - bet + payout + winBonus;
  const gainedXp = Math.floor(xp * (owned.has("gold-croupier") ? 1.1 : 1));
  const nextXp = user.xp + gainedXp;
  const won = Math.max(0, payout + winBonus - bet);

  await prisma.user.update({
    where: { id: userId },
    data: {
      coins,
      xp: nextXp,
      level: levelFromXp(nextXp),
      gamesPlayed: { increment: 1 },
      totalWon: { increment: won },
      biggestWin: won > user.biggestWin ? won : user.biggestWin,
    },
  });

  let cardId: string | null = null;
  if (payout > bet) {
    cardId = rollCardDrop(dropChance);
    if (cardId) await grantCardTx(userId, cardId, "Game drop");
  }

  const fresh = await loadUser(userId);
  return {
    ok: true,
    cardId,
    net,
    player: toPublicPlayer(fresh as UserWithInventory),
  };
}
