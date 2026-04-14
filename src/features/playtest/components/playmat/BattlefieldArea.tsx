import type { WheelEvent } from "react";
import { Button } from "@/components/ui/button";
import type { CardInstance } from "@/lib/game/types";
import { BattlefieldCard } from "./BattlefieldCard";
import { BATTLEFIELD_ZOOM_STEP, GRID_SIZE } from "./constants";
import type { CardHoverInfo } from "./types";

type BattlefieldDisplayCard = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  cardType: string;
  power: string | null;
  toughness: string | null;
};

type BattlefieldAreaProps = {
  setRefs: (node: HTMLDivElement | null) => void;
  isActiveDropTarget: boolean;
  isAnyDragActive: boolean;
  playerName: string;
  life: number;
  turnLabel: string;
  battlefieldZoom: number;
  battlefieldCards: BattlefieldDisplayCard[];
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
  onChangeLife: (delta: number) => void;
  onAdjustZoom: (delta: number) => void;
  onHoverCard: (
    cardId: string,
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  onTapCard: (card: CardInstance) => void;
};

export function BattlefieldArea({
  setRefs,
  isActiveDropTarget,
  isAnyDragActive,
  playerName,
  life,
  turnLabel,
  battlefieldZoom,
  battlefieldCards,
  onWheel,
  onChangeLife,
  onAdjustZoom,
  onHoverCard,
  onTapCard,
}: BattlefieldAreaProps) {
  return (
    <div
      ref={setRefs}
      className={`relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-dashed border-white/25 bg-black/10 ${
        isAnyDragActive
          ? isActiveDropTarget
            ? "ring-2 ring-cyan-400/80 bg-cyan-500/10"
            : "ring-1 ring-cyan-300/40 bg-cyan-500/5"
          : ""
      }`}
      onWheel={onWheel}
    >
      <div className="absolute left-3 top-3 z-20 flex items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-sm">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
            Jogador
          </p>
          <p className="text-sm font-bold text-white">{playerName}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/90 hover:bg-white/10 hover:text-white"
            onClick={() => onChangeLife(-1)}
          >
            -
          </Button>
          <span className="min-w-8 text-center text-2xl font-black tabular-nums text-white">
            {life}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/90 hover:bg-white/10 hover:text-white"
            onClick={() => onChangeLife(1)}
          >
            +
          </Button>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
            Turno
          </p>
          <p className="text-xs font-semibold text-white/90">{turnLabel}</p>
        </div>
      </div>

      <div className="absolute right-3 top-3 z-20 flex items-center gap-1 text-[10px] font-semibold text-white/80">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-white/90 hover:bg-white/10 hover:text-white"
          onClick={() => onAdjustZoom(-BATTLEFIELD_ZOOM_STEP)}
        >
          -
        </Button>
        <div className="pointer-events-none rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80">
          Zoom ({Math.round(battlefieldZoom * 100)}%)
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-white/90 hover:bg-white/10 hover:text-white"
          onClick={() => onAdjustZoom(BATTLEFIELD_ZOOM_STEP)}
        >
          +
        </Button>
      </div>

      <div
        className="relative h-full w-full"
        style={{
          transform: `scale(${battlefieldZoom})`,
          transformOrigin: "top left",
          width: `${100 / battlefieldZoom}%`,
          height: `${100 / battlefieldZoom}%`,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: "0 0",
        }}
      >
        {battlefieldCards.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex h-full items-center justify-center text-xs uppercase tracking-[0.35em] text-white/30">
            Campo de batalha
          </div>
        )}

        {battlefieldCards.map(
          ({ card, name, imageUrl, manaCost, cardType, power, toughness }) => (
            <BattlefieldCard
              key={card.id}
              card={card}
              name={name}
              imageUrl={imageUrl}
              manaCost={manaCost}
              cardType={cardType}
              power={power}
              toughness={toughness}
              onHover={(info, target) => onHoverCard(card.id, info, target)}
              onTap={() => onTapCard(card)}
            />
          ),
        )}
      </div>
    </div>
  );
}
