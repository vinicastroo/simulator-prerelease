"use client";

import Image from "next/image";
import type { CardInstance, GameState } from "@/lib/game/types";
import { selectCardWithDefinition } from "@/lib/game/selectors";

type CardViewProps = {
  card: CardInstance;
  state: GameState;
  onHover?: (card: { name: string; imageUrl: string | null } | null) => void;
  onClick?: () => void;
};

function CardBack({ tapped }: { tapped?: boolean }) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center ${tapped ? "opacity-70" : ""}`}
    >
      <div className="w-[80%] h-[80%] border border-zinc-600 rounded-sm flex items-center justify-center">
        <span className="text-zinc-500 text-[10px]">MTG</span>
      </div>
    </div>
  );
}

function CardView({ card, state, onHover, onClick }: CardViewProps) {
  const cd = selectCardWithDefinition(state, card.id);
  const imgUrl = card.faceDown ? null : (cd?.definition.imageUrl ?? null);

  return (
    <div
      className={`relative w-[64px] h-[89px] rounded overflow-hidden cursor-pointer ring-1 ring-zinc-700 transition-all hover:ring-blue-400 hover:scale-105 ${card.tapped ? "rotate-90 origin-bottom-left" : ""}`}
      style={{ flexShrink: 0 }}
      onMouseEnter={() =>
        onHover?.({
          name: cd?.definition.name ?? "card",
          imageUrl: card.faceDown ? null : (cd?.definition.imageUrl ?? null),
        })
      }
      onMouseLeave={() => onHover?.(null)}
      onClick={onClick}
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
        <CardBack tapped={card.tapped} />
      )}
      {card.tapped && (
        <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
      )}
      {/* Counter badges */}
      {Object.entries(card.counters).some(([, v]) => v > 0) && (
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-0.5 p-0.5 bg-black/60">
          {Object.entries(card.counters)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => (
              <span key={k} className="text-[8px] text-white leading-none">
                {k}:{v}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

type BattlefieldSectionProps = {
  label: string;
  cards: CardInstance[];
  state: GameState;
  onHover?: (card: { name: string; imageUrl: string | null } | null) => void;
  onCardClick?: (cardId: string) => void;
  className?: string;
};

function BattlefieldSection({
  label,
  cards,
  state,
  onHover,
  onCardClick,
  className = "",
}: BattlefieldSectionProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 min-h-[100px] rounded-lg border border-dashed border-zinc-800 p-2">
        {cards.map((card) => (
          <CardView
            key={card.id}
            card={card}
            state={state}
            onHover={onHover}
            onClick={() => onCardClick?.(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

type BattlefieldProps = {
  lands: CardInstance[];
  nonLands: CardInstance[];
  state: GameState;
  onHover?: (card: { name: string; imageUrl: string | null } | null) => void;
  onCardClick?: (cardId: string) => void;
};

export function Battlefield({
  lands,
  nonLands,
  state,
  onHover,
  onCardClick,
}: BattlefieldProps) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto p-3">
      <BattlefieldSection
        label="Permanentes"
        cards={nonLands}
        state={state}
        onHover={onHover}
        onCardClick={onCardClick}
      />
      <BattlefieldSection
        label="Terrenos"
        cards={lands}
        state={state}
        onHover={onHover}
        onCardClick={onCardClick}
      />
    </div>
  );
}
