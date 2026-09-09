"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Coins,
  Gift,
  Layers,
  LayoutGrid,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { AmbientBackground } from "@/components/ambient-background";
import { AVATARS } from "@/lib/game-data";
import { cn, formatCoins, xpProgress } from "@/lib/utils";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";

const links = [
  { href: "/lobby", label: "Lobby", icon: LayoutGrid },
  { href: "/rewards", label: "Chest", icon: Gift },
  { href: "/inventory", label: "Cards", icon: Layers },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/settings", label: "Account", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const player = useCasinoStore(selectPlayer);
  const sessionUser = useCasinoStore((s) => s.sessionUser);
  const logout = useCasinoStore((s) => s.logout);
  const hydrated = useCasinoStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !sessionUser) router.replace("/login");
  }, [hydrated, sessionUser, router]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduce-motion",
      Boolean(player?.settings.reducedMotion),
    );
  }, [player?.settings.reducedMotion]);

  if (!hydrated || !player) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AmbientBackground />
        <p className="relative z-10 font-[family-name:var(--font-display)] text-2xl tracking-[0.22em] text-white">
          SEJNY
        </p>
      </div>
    );
  }

  const progress = xpProgress(player.xp, player.level);
  const avatar =
    AVATARS.find((a) => a.id === player.settings.avatarId) ?? AVATARS[2]!;

  return (
    <div className="relative min-h-screen pb-24 text-[var(--cream)] md:pb-8">
      <AmbientBackground />

      <header className="relative z-20 border-b border-white/8 bg-black/25 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/lobby" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c6cff,#ff5d9a)] text-sm font-bold text-white shadow-[0_0_24px_rgba(124,108,255,0.45)]">
              S
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.16em] text-white">
              SEJNY
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition",
                    active
                      ? "bg-white/10 text-white shadow-[0_0_20px_rgba(124,108,255,0.2)]"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Coins className="h-4 w-4 text-[var(--gold)]" />
              <span className="text-sm font-semibold text-[var(--gold)]">
                {formatCoins(player.coins)}
              </span>
            </div>
            <div className="hidden min-w-[110px] sm:block">
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <span>Lv {player.level}</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#7c6cff,#2dd4a8)]"
                  animate={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#061018]"
              style={{ background: avatar.color }}
              title={player.displayName}
            >
              {player.displayName.slice(0, 1).toUpperCase()}
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-full border border-white/10 p-2 text-[var(--muted)] hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>

      <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-1 rounded-full border border-white/10 bg-black/55 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[10px]",
                active
                  ? "bg-white/12 text-white"
                  : "text-[var(--muted)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
