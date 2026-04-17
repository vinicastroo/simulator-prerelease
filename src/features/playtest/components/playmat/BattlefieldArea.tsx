import type { WheelEvent } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CardInstance } from "@/lib/game/types";
import { BattlefieldCard } from "./BattlefieldCard";
import {
  BATTLEFIELD_CANVAS_SIZE,
  BATTLEFIELD_CARD_HEIGHT,
  BATTLEFIELD_CARD_WIDTH,
  BATTLEFIELD_ZOOM_STEP,
  GRID_SIZE,
} from "./constants";
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

type Pan = { x: number; y: number };

type SelectionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type BattlefieldAreaProps = {
  setRefs?: (node: HTMLDivElement | null) => void;
  isActiveDropTarget: boolean;
  isAnyDragActive: boolean;
  interactive: boolean;
  isActiveTurn: boolean;
  isRollingForFirstTurn?: boolean;
  orientation: "top" | "bottom";
  playerName: string;
  life: number;
  turnLabel: string;
  battlefieldZoom: number;
  battlefieldCards: BattlefieldDisplayCard[];
  activePings?: Set<string>;
  selectedCardIds?: Set<string>;
  hiddenCardIds?: Set<string>;
  pan?: Pan;
  onPan?: (pan: Pan) => void;
  onWheel?: (event: WheelEvent<HTMLDivElement>) => void;
  onChangeLife?: (delta: number) => void;
  onAdjustZoom?: (delta: number) => void;
  onSelectCard?: (cardId: string, additive: boolean) => void;
  onClearSelection?: () => void;
  onSelectionChange?: (cardIds: string[]) => void;
  onHoverCard?: (
    cardId: string,
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  onPingCard?: (cardId: string) => void;
  onModifyCardPT?: (
    cardId: string,
    powerDelta: number,
    toughnessDelta: number,
  ) => void;
  onModifyCardLoyalty?: (cardId: string, delta: number) => void;
  onRightClickCard?: (cardId: string, x: number, y: number) => void;
  onEmptyRightClick?: (x: number, y: number) => void;
};

export const BattlefieldArea = memo(function BattlefieldArea({
  setRefs,
  isActiveDropTarget,
  isAnyDragActive,
  interactive,
  isActiveTurn,
  isRollingForFirstTurn = false,
  orientation,
  playerName,
  life,
  turnLabel: _turnLabel,
  battlefieldZoom,
  battlefieldCards,
  activePings,
  selectedCardIds,
  hiddenCardIds,
  pan: externalPan,
  onPan,
  onWheel,
  onChangeLife,
  onAdjustZoom,
  onSelectCard,
  onClearSelection,
  onSelectionChange,
  onHoverCard,
  onPingCard,
  onModifyCardPT,
  onModifyCardLoyalty,
  onRightClickCard,
  onEmptyRightClick,
}: BattlefieldAreaProps) {
  // When no external pan state is provided, manage it internally (opponent battlefield)
  const [internalPan, setInternalPan] = useState<Pan>({ x: 0, y: 0 });
  const pan = externalPan ?? internalPan;
  const setPan = onPan ?? setInternalPan;

  const selectionStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const panStartRef = useRef<{
    px: number;
    py: number;
    sx: number;
    sy: number;
  } | null>(null);
  const interactionModeRef = useRef<"pan" | "select" | null>(null);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(
    null,
  );

  const hudPosition =
    orientation === "top"
      ? "absolute left-3 bottom-3 z-20"
      : "absolute left-3 top-3 z-20";

  // ── Life delta overlay ─────────────────────────────────────────────────────
  const [lifeDelta, setLifeDelta] = useState(0);
  const [deltaVisible, setDeltaVisible] = useState(false);
  const prevLifeRef = useRef(life);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delta = life - prevLifeRef.current;
    prevLifeRef.current = life;
    if (delta === 0) return;

    setLifeDelta((prev) => prev + delta);
    setDeltaVisible(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setDeltaVisible(false);
      setTimeout(() => setLifeDelta(0), 300);
    }, 2000);
  }, [life]);

  // Grid background computed in screen-space so it tiles infinitely across the
  // whole container regardless of pan position or canvas bounds.
  const gridScreenSize = GRID_SIZE * battlefieldZoom;
  const bgX = ((pan.x % gridScreenSize) + gridScreenSize) % gridScreenSize;
  const bgY = ((pan.y % gridScreenSize) + gridScreenSize) % gridScreenSize;

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      return {
        x: (clientX - rect.left - pan.x) / battlefieldZoom,
        y: (clientY - rect.top - pan.y) / battlefieldZoom,
      };
    },
    [battlefieldZoom, pan.x, pan.y],
  );

  const updateSelection = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const right = Math.max(startX, endX);
      const bottom = Math.max(startY, endY);

      setSelectionRect({
        left,
        top,
        width: right - left,
        height: bottom - top,
      });

      const nextSelectedIds = battlefieldCards
        .filter(({ card }) => {
          const cardLeft = card.battlefield?.x ?? 0;
          const cardTop = card.battlefield?.y ?? 0;
          const cardRight = cardLeft + BATTLEFIELD_CARD_WIDTH;
          const cardBottom = cardTop + BATTLEFIELD_CARD_HEIGHT;

          return !(
            cardRight < left ||
            cardLeft > right ||
            cardBottom < top ||
            cardTop > bottom
          );
        })
        .map(({ card }) => card.id);

      onSelectionChange?.(nextSelectedIds);
    },
    [battlefieldCards, onSelectionChange],
  );

  const handleBackdropPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (e.button !== 0) return;
    if (isAnyDragActive) return;

    const rect = e.currentTarget.getBoundingClientRect();

    e.currentTarget.setPointerCapture(e.pointerId);

    if (e.ctrlKey) {
      interactionModeRef.current = "pan";
      panStartRef.current = {
        px: e.clientX,
        py: e.clientY,
        sx: pan.x,
        sy: pan.y,
      };
      return;
    }

    const point = getCanvasPoint(e.clientX, e.clientY, rect);
    if (!point) return;

    interactionModeRef.current = "select";
    selectionStartRef.current = point;
    onClearSelection?.();
    setSelectionRect({ left: point.x, top: point.y, width: 0, height: 0 });
  };

  const handleBackdropPointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (interactionModeRef.current === "pan") {
      if (!panStartRef.current) return;

      setPan({
        x: panStartRef.current.sx + (e.clientX - panStartRef.current.px),
        y: panStartRef.current.sy + (e.clientY - panStartRef.current.py),
      });
      return;
    }

    if (interactionModeRef.current !== "select" || !selectionStartRef.current) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const point = getCanvasPoint(e.clientX, e.clientY, rect);
    if (!point) return;

    updateSelection(
      selectionStartRef.current.x,
      selectionStartRef.current.y,
      point.x,
      point.y,
    );
  };

  const handleBackdropPointerUp = () => {
    interactionModeRef.current = null;
    selectionStartRef.current = null;
    panStartRef.current = null;
    setSelectionRect(null);
  };

  return (
    <div
      ref={setRefs}
      className={`relative h-full w-full overflow-hidden rounded-2xl border bg-black/10 transition-colors ${
        isRollingForFirstTurn
          ? "animate-pulse border-violet-300 shadow-[0_0_0_2px_rgba(196,181,253,0.5),0_0_34px_rgba(168,85,247,0.35)]"
          : isActiveTurn && orientation === "bottom"
            ? "border-emerald-300/30 shadow-[0_0_0_1px_rgba(52,211,153,0.18),0_0_24px_rgba(52,211,153,0.18)]"
            : isActiveTurn && orientation === "top"
              ? "border-amber-300/30 shadow-[0_0_0_1px_rgba(252,211,77,0.16),0_0_24px_rgba(251,191,36,0.14)]"
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
      {isActiveTurn && !isRollingForFirstTurn ? (
        <div
          className={`pointer-events-none absolute inset-0 z-[5] rounded-2xl ${
            orientation === "bottom"
              ? "battlefield-active-turn-overlay"
              : "battlefield-active-turn-overlay-opponent"
          }`}
        />
      ) : null}

      {/*
        Backdrop: covers 100% of the container at all times.
        - Renders the infinite grid in screen-space so it never has edges.
        - Receives pointer events only when clicking on empty space (cards are
          in a higher layer and stop propagation / capture focus first).
      */}
      <button
        type="button"
        aria-label="Mover campo de batalha"
        className="absolute inset-0 z-0 appearance-none border-0 p-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: `${gridScreenSize}px ${gridScreenSize}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          cursor: isAnyDragActive
            ? "default"
            : interactionModeRef.current === "pan"
              ? "grabbing"
              : "crosshair",
        }}
        onPointerDown={handleBackdropPointerDown}
        onPointerMove={handleBackdropPointerMove}
        onPointerUp={handleBackdropPointerUp}
        onPointerCancel={handleBackdropPointerUp}
        onContextMenu={
          onEmptyRightClick
            ? (e) => {
                e.preventDefault();
                onEmptyRightClick(e.clientX, e.clientY);
              }
            : undefined
        }
      />

      {/*
        Card canvas: large fixed-size canvas that pans and zooms.
        pointer-events: none on the div itself so that click-through on empty
        areas reaches the backdrop; cards inside keep default pointer-events.
      */}
      <div
        className="absolute top-0 left-0 z-10"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${battlefieldZoom})`,
          transformOrigin: "top left",
          width: `${BATTLEFIELD_CANVAS_SIZE}px`,
          height: `${BATTLEFIELD_CANVAS_SIZE}px`,
          pointerEvents: "none",
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
              isSelected={selectedCardIds?.has(card.id)}
              isGhosted={hiddenCardIds?.has(card.id)}
              selectionCount={selectedCardIds?.size ?? 0}
              onSelect={onSelectCard}
              onHover={onHoverCard ?? noopHover}
              isPinged={activePings?.has(card.id)}
              onPing={onPingCard}
              onModifyPT={onModifyCardPT}
              onModifyLoyalty={onModifyCardLoyalty}
              onRightClick={onRightClickCard}
            />
          ),
        )}

        {selectionRect && (
          <div
            className="pointer-events-none absolute z-[40] border border-cyan-300/80 bg-cyan-400/10"
            style={{
              left: selectionRect.left,
              top: selectionRect.top,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}
      </div>

      {/* HUD */}
      <div
        className={`${hudPosition} flex items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-sm`}
      >
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
              <div className="relative min-w-8">
                <span
                  className={`pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-black tabular-nums transition-all duration-300 ${
                    deltaVisible
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0"
                  } ${lifeDelta > 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {lifeDelta > 0 ? `+${lifeDelta}` : lifeDelta}
                </span>
                <span className="block text-center text-2xl font-black tabular-nums text-white">
                  {life}
                </span>
              </div>
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
    </div>
  );
});

function noopHover() {}
