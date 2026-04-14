"use client";

import Image from "next/image";
import { useState } from "react";
import { selectCardWithDefinition } from "@/lib/game/selectors";
import type { CardInstance, GameState } from "@/lib/game/types";

type ZonePanelProps = {
  label: string;
  zone: CardInstance["zone"];
  cards: CardInstance[];
  state: GameState;
  onCardHover?: (
    card: { name: string; imageUrl: string | null } | null,
  ) => void;
  /** Show the full list as a scrollable grid (hand, graveyard, exile…) */
  expanded?: boolean;
  /** For library/command: just show count + face-down stack */
  compact?: boolean;
};

function CardBackSmall() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center rounded">
      <div className="w-[75%] h-[75%] border border-zinc-600 rounded-sm" />
    </div>
  );
}

export function ZonePanel({
  label,
  cards,
  state,
  onCardHover,
  expanded = false,
  compact = false,
}: ZonePanelProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  function handleMouseEnter(cardId: string) {
    const cd = selectCardWithDefinition(state, cardId);
    if (!cd) return;
    setHovered(cardId);
    onCardHover?.({
      name: cd.definition.name,
      imageUrl: cd.instance.faceDown ? null : cd.definition.imageUrl,
    });
  }

  function handleMouseLeave() {
    setHovered(null);
    onCardHover?.(null);
  }

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[60px]">
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
          {label}
        </span>
        <div className="relative w-[52px] h-[72px]">
          {cards.length > 0 ? (
            <CardBackSmall />
          ) : (
            <div className="w-full h-full rounded border border-dashed border-zinc-700" />
          )}
        </div>
        <span className="text-xs text-zinc-300">{cards.length}</span>
      </div>
    );
  }

  if (expanded) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
          {label}
          <span className="ml-1 text-zinc-500">({cards.length})</span>
        </span>
        <div className="flex flex-wrap gap-1 min-h-[76px]">
          {cards.length === 0 && (
            <div className="w-[52px] h-[72px] rounded border border-dashed border-zinc-700" />
          )}
          {cards.map((card) => {
            const cd = selectCardWithDefinition(state, card.id);
            const imgUrl = card.faceDown
              ? null
              : (cd?.definition.imageUrl ?? null);

            return (
              <button
                key={card.id}
                type="button"
                className={`relative w-[52px] h-[72px] rounded overflow-hidden cursor-pointer ring-1 ring-zinc-700 transition-transform hover:scale-105 ${hovered === card.id ? "ring-blue-400" : ""}`}
                onMouseEnter={() => handleMouseEnter(card.id)}
                onMouseLeave={handleMouseLeave}
              >
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={cd?.definition.name ?? "card"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <CardBackSmall />
                )}
                {card.tapped && (
                  <div className="absolute inset-0 bg-amber-400/20 pointer-events-none" />
                )}
                {card.counters &&
                  Object.entries(card.counters).some(([, v]) => v > 0) && (
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-0.5 rounded-tl">
                      {Object.entries(card.counters)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(" ")}
                    </div>
                  )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: small count badge
  return (
    <div className="flex flex-col items-center gap-1 min-w-[52px]">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      <div className="w-[48px] h-[66px] rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 text-sm font-bold">
        {cards.length}
      </div>
    </div>
  );
}
