"use client";

import { useRef } from "react";
import { usePrerelease, type PlacedCardState } from "@/context/PrereleaseContext";

type Props = { placed: PlacedCardState };

export function CardToken({ placed }: Props) {
  const { moveCard, cards } = usePrerelease();
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    offset.current = {
      x: e.clientX - placed.posX,
      y: e.clientY - placed.posY,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    const maxZ = Math.max(...cards.map((c) => c.zIndex), 0);
    moveCard(placed.id, newX, newY, maxZ + 1);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{
        left: placed.posX,
        top: placed.posY,
        zIndex: placed.zIndex,
        width: 130,
        height: 182,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {placed.card.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={placed.card.imagePath}
          alt={placed.card.name}
          className="w-full h-full rounded-lg object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full rounded-lg bg-silverquill-ink border border-gold-accent flex items-center justify-center p-2">
          <span className="text-gold-accent text-xs text-center font-medium leading-tight">
            {placed.card.name}
          </span>
        </div>
      )}
      {placed.isFoil && (
        <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-br from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
}
