"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { AVATARS } from "@/lib/game-data";
import { formatCoins } from "@/lib/utils";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";
import { Panel } from "@/components/ui";

export default function LeaderboardPage() {
  const rows = useCasinoStore((s) => s.leaderboard);
  const refreshLeaderboard = useCasinoStore((s) => s.refreshLeaderboard);
  const me = useCasinoStore(selectPlayer);

  useEffect(() => {
    void refreshLeaderboard();
  }, [refreshLeaderboard]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          House ranks
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-white">
          Leaderboard
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Players ranked by coins, then level. Toggle visibility in Account.
        </p>
      </div>

      <Panel className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <p className="p-8 text-[var(--muted)]">
            No public players yet. Create accounts or enable leaderboard
            visibility.
          </p>
        ) : (
          <ul>
            {rows.map((row, index) => {
              const avatar =
                AVATARS.find((a) => a.id === row.settings.avatarId) ??
                AVATARS[0]!;
              const isMe = me?.username === row.username;
              return (
                <motion.li
                  key={row.username}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`flex items-center gap-4 border-b border-white/6 px-5 py-4 last:border-0 ${
                    isMe ? "bg-[var(--violet)]/10" : ""
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-[var(--gold)] text-[#1a1205]"
                        : index === 1
                          ? "bg-white/80 text-[#12101a]"
                          : index === 2
                            ? "bg-[#c9834a] text-white"
                            : "bg-white/8 text-[var(--muted)]"
                    }`}
                  >
                    {index < 3 ? <Trophy className="h-4 w-4" /> : index + 1}
                  </span>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-[#061018]"
                    style={{ background: avatar.color }}
                  >
                    {row.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">
                      {row.displayName}
                      {isMe && (
                        <span className="ml-2 text-xs font-normal text-[var(--violet)]">
                          you
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Lv {row.level} · {row.ownedCardIds.length} cards ·{" "}
                      {row.stats.gamesPlayed} games
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--gold)]">
                      {formatCoins(row.coins)}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      coins
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
