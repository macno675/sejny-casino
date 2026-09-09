import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoins(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(value)));
}

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`sejny:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function xpForLevel(level: number) {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.45));
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) {
    level += 1;
    if (level >= 99) break;
  }
  return level;
}

export function xpProgress(xp: number, level: number) {
  const currentFloor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = Math.max(1, next - currentFloor);
  return Math.min(1, Math.max(0, (xp - currentFloor) / span));
}
