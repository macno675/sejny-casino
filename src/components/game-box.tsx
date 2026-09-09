"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { GameMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GameBox({
  game,
  index = 0,
  className,
}: {
  game: GameMeta;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.06 * index, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn("h-full", className)}
    >
      <Link
        href={`/games/${game.slug}`}
        className="game-box group relative block h-full min-h-[320px] overflow-hidden rounded-[2rem] outline-none transition duration-500 hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-white/40 sm:min-h-[360px]"
        style={{
          background: `linear-gradient(165deg, ${game.surface} 0%, ${game.surfaceDeep} 100%)`,
          boxShadow: `0 22px 50px ${game.surfaceDeep}66, 0 8px 18px rgba(0,0,0,0.25)`,
        }}
      >
        <div className="game-box-mesh pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -right-16 top-10 h-44 w-44 rounded-full blur-3xl opacity-50"
          style={{ background: game.accent }}
        />

        <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none tracking-tight text-white drop-shadow-sm sm:text-4xl">
                {game.name}
              </h3>
              <p className="mt-1 text-lg font-medium text-white/85 sm:text-xl">
                {game.subtitle}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sm font-bold text-[#1a1a1e] shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
              {game.rating.toFixed(1)}
              <Star className="h-3.5 w-3.5 fill-[#f5a524] text-[#f5a524]" />
            </span>
          </div>

          <div className="relative mt-auto flex flex-1 items-center justify-center py-6">
            <motion.div
              aria-hidden
              className="game-box-hero select-none"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
              style={{ color: game.accent }}
            >
              <span className="block text-[7.5rem] leading-none drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)] transition duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)] sm:text-[8.5rem]">
                {game.motif}
              </span>
            </motion.div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <p className="max-w-[70%] text-sm leading-snug text-white/75">
              {game.blurb}
            </p>
            <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
              {game.tag}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
