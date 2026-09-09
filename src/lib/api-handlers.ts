import { NextResponse } from "next/server";
import {
  changeUserPassword,
  createUser,
  getLeaderboard,
  getPlayerById,
  openDailyChest,
  settleBetForUser,
  updateUserSettings,
} from "@/lib/player-service";
import type { PlayerSettings } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import {
  assertDatabaseEnv,
  attachSessionCookie,
  clearSessionOnResponse,
  hashPassword,
  readSessionUserId,
  verifyPassword,
} from "@/lib/auth";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function fail(error: unknown, fallback = "Server error") {
  const message =
    error instanceof Error && error.message
      ? error.message
      : fallback;
  console.error("[api]", message, error);
  return json({ ok: false, error: message }, 500);
}

export async function requireUserId() {
  return readSessionUserId();
}

export async function handleRegister(body: {
  username?: string;
  password?: string;
  displayName?: string;
}) {
  try {
    assertDatabaseEnv();
    const username = body.username?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const displayName = body.displayName?.trim() ?? "";

    if (username.length < 3) {
      return json(
        { ok: false, error: "Username needs at least 3 characters." },
        400,
      );
    }
    if (password.length < 4) {
      return json(
        { ok: false, error: "Password needs at least 4 characters." },
        400,
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return json({ ok: false, error: "That username is already taken." }, 409);
    }

    const passwordHash = await hashPassword(password);
    const player = await createUser({ username, passwordHash, displayName });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return json({ ok: false, error: "Could not create account." }, 500);
    }

    const response = json({ ok: true, player });
    return attachSessionCookie(response, user.id);
  } catch (error) {
    return fail(error, "Registration failed");
  }
}

export async function handleLogin(body: {
  username?: string;
  password?: string;
}) {
  try {
    assertDatabaseEnv();
    const username = body.username?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return json(
        { ok: false, error: "No account found for that username." },
        401,
      );
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return json({ ok: false, error: "Incorrect password." }, 401);
    }
    const player = await getPlayerById(user.id);
    const response = json({ ok: true, player });
    return attachSessionCookie(response, user.id);
  } catch (error) {
    return fail(error, "Login failed");
  }
}

export async function handleLogout() {
  try {
    return clearSessionOnResponse(json({ ok: true }));
  } catch (error) {
    return fail(error, "Logout failed");
  }
}

export async function handleMe() {
  try {
    const userId = await requireUserId();
    if (!userId) return json({ ok: false, player: null }, 401);
    const player = await getPlayerById(userId);
    if (!player) return json({ ok: false, player: null }, 401);
    return json({ ok: true, player });
  } catch (error) {
    return fail(error, "Could not load profile");
  }
}

export async function handleSettings(patch: Partial<PlayerSettings>) {
  try {
    const userId = await requireUserId();
    if (!userId) return json({ ok: false, error: "Not signed in." }, 401);
    const player = await updateUserSettings(userId, patch);
    return json({ ok: true, player });
  } catch (error) {
    return fail(error, "Could not update settings");
  }
}

export async function handlePasswordChange(body: {
  current?: string;
  next?: string;
}) {
  try {
    const userId = await requireUserId();
    if (!userId) return json({ ok: false, error: "Not signed in." }, 401);
    const current = body.current ?? "";
    const next = body.next ?? "";
    if (next.length < 4) {
      return json(
        { ok: false, error: "New password needs at least 4 characters." },
        400,
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return json({ ok: false, error: "Not signed in." }, 401);
    const valid = await verifyPassword(current, user.passwordHash);
    if (!valid) {
      return json({ ok: false, error: "Current password is incorrect." }, 400);
    }
    await changeUserPassword(userId, await hashPassword(next));
    return json({ ok: true });
  } catch (error) {
    return fail(error, "Could not change password");
  }
}

export async function handleChestOpen() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return json({ ok: false, error: "Sign in to open the chest." }, 401);
    }
    const result = await openDailyChest(userId);
    if (!result.ok) return json(result, 400);
    return json(result);
  } catch (error) {
    return fail(error, "Could not open chest");
  }
}

export async function handleSettle(body: {
  bet?: number;
  payout?: number;
  xp?: number;
  dropChance?: number;
}) {
  try {
    const userId = await requireUserId();
    if (!userId) return json({ ok: false, error: "Not signed in." }, 401);
    const result = await settleBetForUser(userId, {
      bet: Number(body.bet) || 0,
      payout: Number(body.payout) || 0,
      xp: body.xp,
      dropChance: body.dropChance,
    });
    if (!result.ok) return json(result, 400);
    return json(result);
  } catch (error) {
    return fail(error, "Could not settle bet");
  }
}

export async function handleLeaderboard() {
  try {
    const rows = await getLeaderboard();
    return json({ ok: true, rows });
  } catch (error) {
    return fail(error, "Could not load leaderboard");
  }
}
