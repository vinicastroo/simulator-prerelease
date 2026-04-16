import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { memo, useMemo } from "react";
import type { CardInstance } from "@/lib/game/types";
import { CardBack } from "../CardBack";
import { HAND_CARD_HEIGHT, HAND_CARD_SPACING, HAND_CARD_WIDTH } from "./constants";
import { ManaCostBadges } from "./ManaCostBadges";
import type { CardHoverInfo, DragCardData } from "./types";
import { parseManaCost } from "./utils";

type HandCardProps = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  index: number;
  total: number;
  isAnyDragActive: boolean;
  isHidden: boolean;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
};

export const HandCard = memo(function HandCard({
  card,
  name,
  imageUrl,
  manaCost,
  index,
  total,
  isAnyDragActive,
  isHidden,
  onHover,
}: HandCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        cardId: card.id,
        from: "hand",
      } satisfies DragCardData,
    });

  const symbols = useMemo(() => parseManaCost(manaCost), [manaCost]);
  const xOffset = (index - (total - 1) / 2) * HAND_CARD_SPACING;
  const rotate = (index - (total - 1) / 2) * 3;
  const yOffset = Math.abs(index - (total - 1) / 2) * 4;

  const dragTransform = transform ? CSS.Translate.toString(transform) : "";
  const baseTransform = `translateX(calc(-50% + ${xOffset}px)) translateY(${yOffset}px) rotate(${rotate}deg)`;
  const combinedTransform = dragTransform
    ? `${dragTransform} ${baseTransform}`
    : baseTransform;

  return (
    <button
      ref={setNodeRef}
      type="button"
      draggable={false}
      className={`absolute -bottom-6 cursor-pointer select-none touch-none transition-all duration-200 ease-out ${
        isAnyDragActive
          ? ""
          : "hover:-translate-y-12 hover:z-[100] hover:scale-125"
      }`}
      style={{
        left: "50%",
        opacity: isHidden ? 0 : 1,
        transform: combinedTransform,
        zIndex: isDragging ? 200 : index,
        transformOrigin: "bottom center",
        transition: isDragging ? "none" : undefined,
      }}
      onMouseEnter={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseMove={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseLeave={() => onHover(null, null)}
      onContextMenu={(event) => event.preventDefault()}
      {...listeners}
      {...attributes}
    >
      <div className="group relative">
        <ManaCostBadges cardId={card.id} manaCost={manaCost} />

        {imageUrl ? (
          <div
            className="overflow-hidden rounded-[6px] border border-white/10 bg-zinc-900 shadow-xl"
            style={{
              width: `${HAND_CARD_WIDTH}px`,
              height: `${HAND_CARD_HEIGHT}px`,
            }}
          >
            <Image
              src={imageUrl}
              alt={name}
              width={HAND_CARD_WIDTH}
              height={HAND_CARD_HEIGHT}
              className="h-full w-full object-cover"
              draggable={false}
              unoptimized
            />
          </div>
        ) : (
          <div
            style={{
              width: `${HAND_CARD_WIDTH}px`,
              height: `${HAND_CARD_HEIGHT}px`,
            }}
          >
            <CardBack className="h-full w-full" />
          </div>
        )}
      </div>
    </button>
  );
});
