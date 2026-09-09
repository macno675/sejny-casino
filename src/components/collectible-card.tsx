"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { InventoryItem, SpecialCard } from "@/lib/types";
import { cn } from "@/lib/utils";

const rarityTone: Record<SpecialCard["rarity"], string> = {
  common: "from-white/20 to-white/5",
  rare: "from-sky-400/40 to-cyan-500/10",
  epic: "from-fuchsia-400/45 to-violet-500/10",
  legendary: "from-amber-300/50 to-orange-500/15",
};

export function CollectibleCard({
  card,
  item,
  large = false,
  index = 0,
}: {
  card: SpecialCard;
  item?: InventoryItem;
  large?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.7,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="card-perspective"
    >
      <div
        className={cn(
          "card-3d group relative overflow-hidden rounded-[1.6rem]",
          large ? "aspect-[3/4.4]" : "aspect-[3/4.2]",
        )}
        style={{
          boxShadow: `0 25px 60px rgba(0,0,0,0.45), 0 0 40px ${card.glow}`,
        }}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[1.6rem] bg-gradient-to-br p-[1.5px]",
            rarityTone[card.rarity],
          )}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-[#090b14]">
            <Image
              src={card.image}
              alt={card.name}
              fill
              sizes="(max-width:768px) 50vw, 280px"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-[#06080f]/45 to-transparent" />
            <div
              className="absolute inset-0 opacity-40 mix-blend-screen"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${card.glow}, transparent 55%)`,
              }}
            />
            <div className="shine-sweep absolute inset-0" />

            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
              <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
                {card.type}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md"
                style={{
                  background: `${card.accent}33`,
                  color: card.accent,
                  boxShadow: `0 0 16px ${card.glow}`,
                }}
              >
                {card.rarity}
              </span>
            </div>

            <div className="absolute inset-x-0 top-[28%] flex justify-center">
              <motion.span
                animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,0.35)]"
                style={{ color: card.accent }}
              >
                {card.motif}
              </motion.span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-white">
                {card.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/65">
                {card.description}
              </p>
              <p className="mt-3 text-xs font-medium" style={{ color: card.accent }}>
                {card.bonus}
              </p>
              {item && (
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/40">
                  {item.source} · {new Date(item.obtainedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
