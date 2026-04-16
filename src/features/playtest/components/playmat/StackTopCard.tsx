import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import { memo } from "react";
import { CardBack } from "../CardBack";
import type { CardHoverInfo, DragCardData } from "./types";

type StackTopCardProps = {
  cardId: string;
  zone: "graveyard" | "exile";
  name: string;
  imageUrl: string | null;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
};

export const StackTopCard = memo(function StackTopCard({
  cardId,
  zone,
  name,
  imageUrl,
  onHover,
}: StackTopCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: cardId,
    data: {
      cardId,
      from: zone,
    } satisfies DragCardData,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="absolute inset-0"
      onMouseEnter={(e) => onHover({ name, imageUrl }, e.currentTarget)}
      onMouseLeave={() => onHover(null, null)}
      {...listeners}
      {...attributes}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={100}
          height={140}
          className="h-full w-full rounded-[8px] border border-white/10 object-cover"
          draggable={false}
          unoptimized
        />
      ) : (
        <CardBack className="h-full w-full" />
      )}
    </button>
  );
});
