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
  setRefs?: (node: HTMLDivElement | null) => void;
  isActiveDropTarget: boolean;
  isAnyDragActive: boolean;
  interactive: boolean;
  isActiveTurn: boolean;
  orientation: "top" | "bottom";
  playerName: string;
  life: number;
  turnLabel: string;
  battlefieldZoom: number;
  battlefieldCards: BattlefieldDisplayCard[];
  activePings?: Set<string>;
  onWheel?: (event: WheelEvent<HTMLDivElement>) => void;
  onChangeLife?: (delta: number) => void;
  onAdjustZoom?: (delta: number) => void;
  onHoverCard?: (
    cardId: string,
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  onPingCard?: (cardId: string) => void;
};

export function BattlefieldArea({
  setRefs,
  isActiveDropTarget,
  isAnyDragActive,
  interactive,
  isActiveTurn,
  orientation,
  playerName,
  life,
  turnLabel,
  battlefieldZoom,
  battlefieldCards,
  activePings,
  onWheel,
  onChangeLife,
  onAdjustZoom,
  onHoverCard,
  onPingCard,
}: BattlefieldAreaProps) {
  const hudPosition = orientation === "top"
    ? "absolute left-3 bottom-3 z-20"
    : "absolute left-3 top-3 z-20";

  return (
    <div
      ref={setRefs}
      className={`relative h-full w-full overflow-hidden rounded-2xl border bg-black/10 transition-colors ${
        isActiveTurn
          ? "border-cyan-400/60 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
          : "border-dashed border-white/15"
      } ${
        interactive && isAnyDragActive
          ? isActiveDropTarget
            ? "ring-2 ring-cyan-400/80 bg-cyan-500/10"
            : "ring-1 ring-cyan-300/40 bg-cyan-500/5"
          : ""
      }`}
      onWheel={onWheel}
    >
      {/* HUD */}
      <div className={`${hudPosition} flex items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-sm`}>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
            {interactive ? "Jogador" : "Oponente"}
          </p>
          <p className="text-sm font-bold text-white">{playerName}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {interactive && onChangeLife ? (
            <>
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
            </>
          ) : (
            <span className="min-w-8 text-center text-2xl font-black tabular-nums text-white">
              {life}
            </span>
          )}
        </div>

      </div>

      {/* Zoom controls */}
      {onAdjustZoom && (
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
      )}

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
              onHover={
                onHoverCard
                  ? (info, target) => onHoverCard(card.id, info, target)
                  : () => {}
              }
              isPinged={activePings?.has(card.id)}
              onPing={onPingCard ? () => onPingCard(card.id) : undefined}
            />
          ),
        )}
      </div>
    </div>
  );
}
