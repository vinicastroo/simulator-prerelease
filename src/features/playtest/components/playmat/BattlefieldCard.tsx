import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { memo, useMemo } from "react";
import type { CardInstance } from "@/lib/game/types";
import { CardBack } from "../CardBack";
import { BATTLEFIELD_CARD_HEIGHT, BATTLEFIELD_CARD_WIDTH } from "./constants";
import { ManaCostBadges } from "./ManaCostBadges";
import type { CardHoverInfo, DragCardData } from "./types";
import { parseManaCost } from "./utils";

type BattlefieldCardProps = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  cardType: string;
  power: string | null;
  toughness: string | null;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
  onTap: () => void;
};

export const BattlefieldCard = memo(function BattlefieldCard({
  card,
  name,
  imageUrl,
  manaCost,
  cardType,
  power,
  toughness,
  onHover,
  onTap,
}: BattlefieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        cardId: card.id,
        from: "battlefield",
      } satisfies DragCardData,
    });

  const symbols = useMemo(() => parseManaCost(manaCost), [manaCost]);
  const isCreature = useMemo(() => {
    if (card.faceDown) return false;
    return cardType.toLowerCase().includes("creature");
  }, [card.faceDown, cardType]);

  const dragTransform = transform ? CSS.Translate.toString(transform) : "";
  const combinedTransform = `${dragTransform ? `${dragTransform} ` : ""}${
    !isDragging && card.tapped ? "rotate(90deg)" : ""
  }`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      draggable={false}
      className="absolute cursor-pointer select-none touch-none border-0 bg-transparent p-0 outline-none hover:z-10 hover:scale-105 focus:outline-none focus-visible:outline-none"
      style={{
        opacity: isDragging ? 0 : 1,
        transformOrigin: "center center",
        left: card.battlefield?.x ?? 0,
        top: card.battlefield?.y ?? 0,
        transform: combinedTransform,
        zIndex: isDragging ? 999 : (card.battlefield?.z ?? 0) + 20,
        transition: isDragging ? "none" : undefined,
      }}
      onMouseEnter={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseMove={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseLeave={() => onHover(null, null)}
      onClick={onTap}
      onContextMenu={(event) => event.preventDefault()}
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
        <ManaCostBadges cardId={card.id} symbols={symbols} />

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

        {Object.entries(card.counters).some(([, value]) => value > 0) && (
          <div className="absolute -bottom-1 left-0 right-0 flex flex-wrap justify-center gap-0.5">
            {Object.entries(card.counters)
              .filter(([, value]) => value > 0)
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

        {isCreature && power !== null && toughness !== null && (
          <div className="absolute -bottom-2 right-0 z-30 flex items-center gap-0.5">
            <span className="flex h-5 min-w-5 items-center justify-center rounded-sm border border-white/30 bg-black/85 px-1 text-[10px] font-bold leading-none text-white">
              {power}
            </span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-sm border border-white/30 bg-black/85 px-1 text-[10px] font-bold leading-none text-white">
              {toughness}
            </span>
          </div>
        )}
      </div>
    </button>
  );
});
