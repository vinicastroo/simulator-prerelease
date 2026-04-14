import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import type { DragCardData } from "./types";

type DeckTopCardProps = {
  cardId: string;
};

export const DeckTopCard = memo(function DeckTopCard({
  cardId,
}: DeckTopCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: cardId,
    data: {
      cardId,
      from: "library",
    } satisfies DragCardData,
  });

  return (
    <span
      ref={setNodeRef}
      className="absolute inset-0"
      {...listeners}
      {...attributes}
    />
  );
});
