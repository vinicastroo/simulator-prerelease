import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { CardInstance } from "@/lib/game/types";
import { CardBack } from "../CardBack";
import {
  ABILITY_MARKER_IDS,
  BATTLEFIELD_CARD_HEIGHT,
  BATTLEFIELD_CARD_WIDTH,
} from "./constants";
import { ManaCostBadges } from "./ManaCostBadges";
import type { CardHoverInfo, DragCardData } from "./types";

type BattlefieldCardProps = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  cardType: string;
  power: string | null;
  toughness: string | null;
  isSelected?: boolean;
  isGhosted?: boolean;
  selectionCount?: number;
  onSelect?: (additive: boolean) => void;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
  /** Called on click so the parent can broadcast a ping to the opponent */
  onPing?: () => void;
  /** True when the opponent pinged this card (received via Pusher) */
  isPinged?: boolean;
  /** Left click = +1 on that stat, right click = -1 */
  onModifyPT?: (powerDelta: number, toughnessDelta: number) => void;
  /** Left click = +1 loyalty, right click = -1 loyalty */
  onModifyLoyalty?: (delta: number) => void;
  /** Right-click anywhere on the card (except P/T and loyalty boxes) */
  onRightClick?: (x: number, y: number) => void;
};

export const BattlefieldCard = memo(function BattlefieldCard({
  card,
  name,
  imageUrl,
  manaCost,
  cardType,
  power,
  toughness,
  isSelected = false,
  isGhosted = false,
  selectionCount = 0,
  onSelect,
  onHover,
  onPing,
  isPinged = false,
  onModifyPT,
  onModifyLoyalty,
  onRightClick,
}: BattlefieldCardProps) {
  const [pinged, setPinged] = useState(false);

  const handleClick = useCallback(() => {
    setPinged(true);
    onPing?.();
  }, [onPing]);

  const handlePointerDownCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        onSelect?.(true);
        return;
      }

      if (!isSelected || selectionCount <= 1) {
        onSelect?.(false);
      }
    },
    [isSelected, onSelect, selectionCount],
  );

  useEffect(() => {
    if (!isPinged) return;
    setPinged(true);
  }, [isPinged]);

  useEffect(() => {
    if (!pinged) return;
    const t = setTimeout(() => setPinged(false), 500);
    return () => clearTimeout(t);
  }, [pinged]);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        cardId: card.id,
        from: "battlefield",
      } satisfies DragCardData,
    });

  const isCreature = useMemo(() => {
    if (card.faceDown) return false;
    return cardType.toLowerCase().includes("creature");
  }, [card.faceDown, cardType]);

  const isPlaneswalker = useMemo(() => {
    if (card.faceDown) return false;
    return cardType.toLowerCase().includes("planeswalker");
  }, [card.faceDown, cardType]);

  const dragTransform = transform ? CSS.Translate.toString(transform) : "";
  const combinedTransform = `${dragTransform ? `${dragTransform} ` : ""}${
    !isDragging && card.tapped ? "rotate(90deg)" : ""
  }`;

  const loyalty = card.counters.loyalty ?? 0;

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: draggable battlefield card contains nested interactive controls */
    <div
      ref={setNodeRef}
      draggable={false}
      className="absolute cursor-pointer select-none touch-none outline-none hover:z-10 hover:scale-105 focus:outline-none focus-visible:outline-none"
      style={{
        opacity: isDragging || isGhosted ? 0 : 1,
        transformOrigin: "center center",
        left: card.battlefield?.x ?? 0,
        top: card.battlefield?.y ?? 0,
        transform: combinedTransform,
        zIndex: isDragging ? 999 : (card.battlefield?.z ?? 0) + 20,
        transition: isDragging ? "none" : undefined,
        pointerEvents: isGhosted ? "none" : "auto",
      }}
      onMouseEnter={(event) =>
        onHover({ name, imageUrl, power, toughness, cardType }, event.currentTarget)
      }
      onMouseMove={(event) =>
        onHover({ name, imageUrl, power, toughness, cardType }, event.currentTarget)
      }
      onMouseLeave={() => onHover(null, null)}
      onPointerDownCapture={handlePointerDownCapture}
      onClick={(event) => {
        if (event.shiftKey) return;
        handleClick();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") handleClick();
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onRightClick?.(event.clientX, event.clientY);
      }}
      {...listeners}
      {...attributes}
    >
      <div
        className="relative"
        style={{
          width: `${BATTLEFIELD_CARD_WIDTH}px`,
          height: `${BATTLEFIELD_CARD_HEIGHT}px`,
        }}
      >
        {pinged && (
          <div
            className="pointer-events-none absolute inset-0 z-[60] animate-ping rounded-[4px] ring-2 ring-yellow-400/80 bg-yellow-400/15"
            style={{ animationDuration: "0.5s" }}
          />
        )}

        {isSelected && (
          <div className="pointer-events-none absolute inset-0 z-[55] rounded-[4px] ring-2 ring-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.55),0_0_24px_rgba(34,211,238,0.24)]" />
        )}

        <ManaCostBadges cardId={card.id} manaCost={manaCost} />

        {imageUrl ? (
          <div
            className="overflow-hidden rounded-[4px] shadow-md"
            style={{
              width: `${BATTLEFIELD_CARD_WIDTH}px`,
              height: `${BATTLEFIELD_CARD_HEIGHT}px`,
            }}
          >
            <Image
              src={imageUrl}
              alt={name}
              width={BATTLEFIELD_CARD_WIDTH}
              height={BATTLEFIELD_CARD_HEIGHT}
              className="h-full w-full rounded-[4px] border border-white/10 object-cover"
              draggable={false}
              unoptimized
            />
          </div>
        ) : (
          <CardBack className="h-full w-full" />
        )}

        {card.battlefield?.attachedTo && (
          <div className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-blue-600 text-[8px] text-white shadow-lg">
            L
          </div>
        )}

        {card.battlefield?.attachments &&
          card.battlefield.attachments.length > 0 && (
            <div className="absolute -left-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-orange-600 text-[8px] text-white shadow-lg">
              {card.battlefield.attachments.length}
            </div>
          )}

        {/* Ability marker icons — top-right corner row */}
        {Object.entries(card.counters).some(
          ([key, value]) => value > 0 && ABILITY_MARKER_IDS.has(key),
        ) && (
          <div className="absolute right-0 top-0 z-30 flex flex-col items-end gap-0.5 p-0.5">
            {Object.entries(card.counters)
              .filter(
                ([key, value]) => value > 0 && ABILITY_MARKER_IDS.has(key),
              )
              .map(([marker]) => (
                <div
                  key={marker}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/50 bg-black/80 shadow-[0_0_4px_rgba(34,211,238,0.4)]"
                  title={marker}
                >
                  <Image
                    src={`/ability/${marker}.svg`}
                    alt={marker}
                    width={14}
                    height={14}
                    className="h-[70%] w-[70%] object-contain brightness-[2] invert"
                    unoptimized
                    draggable={false}
                  />
                </div>
              ))}
          </div>
        )}

        {/* Regular counters — bottom strip */}
        {Object.entries(card.counters).some(
          ([key, value]) =>
            value > 0 &&
            !ABILITY_MARKER_IDS.has(key) &&
            !(isPlaneswalker && key === "loyalty"),
        ) && (
          <div className="absolute -bottom-1 left-0 right-0 flex flex-wrap justify-center gap-0.5">
            {Object.entries(card.counters)
              .filter(
                ([key, value]) =>
                  value > 0 &&
                  !ABILITY_MARKER_IDS.has(key) &&
                  !(isPlaneswalker && key === "loyalty"),
              )
              .map(([counter, value]) => (
                <span
                  key={counter}
                  className="rounded-full bg-black/80 px-1 text-[8px] leading-tight text-white"
                >
                  {counter === "+1/+1"
                    ? `+${value}`
                    : counter === "-1/-1"
                      ? `-${value}`
                      : `${counter}:${value}`}
                </span>
              ))}
          </div>
        )}

        {/* Creature P/T — left click +1, right click -1 */}
        {isCreature && power !== null && toughness !== null && (
          <div className="absolute -bottom-2 right-0 z-30 flex items-center gap-0.5">
            <button
              type="button"
              className="flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-sm border border-white/30 bg-black/85 px-1.5 text-xs font-bold leading-none text-white transition hover:border-white/70 hover:bg-black active:scale-95"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onModifyPT?.(1, 0);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onModifyPT?.(-1, 0);
              }}
            >
              {power}
            </button>
            <button
              type="button"
              className="flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-sm border border-white/30 bg-black/85 px-1.5 text-xs font-bold leading-none text-white transition hover:border-white/70 hover:bg-black active:scale-95"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onModifyPT?.(0, 1);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onModifyPT?.(0, -1);
              }}
            >
              {toughness}
            </button>
          </div>
        )}

        {/* Planeswalker loyalty — left click +1, right click -1 */}
        {isPlaneswalker && (
          <div className="absolute -bottom-2 right-0 z-30">
            <button
              type="button"
              className="flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-sm border border-amber-400/50 bg-black/85 px-1.5 text-xs font-bold leading-none text-amber-200 transition hover:border-amber-300 hover:bg-black active:scale-95"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onModifyLoyalty?.(1);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onModifyLoyalty?.(-1);
              }}
            >
              {loyalty}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
