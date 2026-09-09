"use client";

import { useMemo, useState } from "react";
import { CollectibleCard } from "@/components/collectible-card";
import { Panel } from "@/components/ui";
import { getCard } from "@/lib/game-data";
import type { CardType, InventoryItem, SpecialCard } from "@/lib/types";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";

type OwnedEntry = { item: InventoryItem; card: SpecialCard };

export default function InventoryPage() {
  const player = useCasinoStore(selectPlayer);
  const [filter, setFilter] = useState<"All" | CardType>("All");

  const owned = useMemo<OwnedEntry[]>(() => {
    if (!player) return [];
    return player.inventory.flatMap((item) => {
      const card = getCard(item.cardId);
      return card ? [{ item, card }] : [];
    });
  }, [player]);

  const types = useMemo(() => {
    const set = new Set(owned.map((o) => o.card.type));
    return ["All", ...Array.from(set)] as ("All" | CardType)[];
  }, [owned]);

  const visible =
    filter === "All" ? owned : owned.filter((o) => o.card.type === filter);

  if (!player) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-white">
            My cards
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Only what you own — holographic sleeves with type tags and live
            bonuses.
          </p>
        </div>
        <Panel className="px-4 py-3 text-sm text-[var(--muted)]">
          <span className="text-white">{owned.length}</span> in sleeve
        </Panel>
      </div>

      {owned.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === type
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-[var(--muted)] hover:bg-white/8"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {owned.length === 0 ? (
        <Panel className="py-16 text-center">
          <p className="text-lg text-white">Your sleeve is empty</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Open the daily chest or win drops at the tables.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map(({ card, item }, index) => (
            <CollectibleCard
              key={item.id}
              card={card}
              item={item}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
