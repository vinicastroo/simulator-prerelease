"use client";

import Image from "next/image";
import type { DragEvent, MouseEvent } from "react";
import { selectCardWithDefinition } from "@/lib/game/selectors";
import type { CardInstance, GameState } from "@/lib/game/types";
import { CardBack } from "./CardBack";

export type CardViewProps = {
  card: CardInstance;
  state: GameState;
  onHover: (info: { name: string; imageUrl: string | null } | null) => void;
  onTap: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
};

export function CardView({
  card,
  state,
  onHover,
  onTap,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: CardViewProps) {
  const cd = selectCardWithDefinition(state, card.id);
  const imgUrl = card.faceDown ? null : (cd?.definition.imageUrl ?? null);

  return (
    <button
      type="button"
      className={`absolute cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10 ${card.tapped ? "rotate-90" : ""}`}
      style={{
        transformOrigin: "center bottom",
        left: card.battlefield?.x ?? 0,
        top: card.battlefield?.y ?? 0,
        zIndex: (card.battlefield?.z ?? 0) + 20,
      }}
      onMouseEnter={() =>
        onHover({
          name: cd?.definition.name ?? "carta",
          imageUrl: card.faceDown ? null : imgUrl,
        })
      }
      onMouseLeave={() => onHover(null)}
      onClick={onTap}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {imgUrl ? (
        <div className="w-[64px] h-[89px] rounded-[4px] overflow-hidden ring-1 ring-white/10 shadow-md">
          <Image
            src={imgUrl}
            alt={cd?.definition.name ?? "card"}
            width={64}
            height={89}
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <CardBack className="w-[64px] h-[89px]" />
      )}

      {card.battlefield?.attachedTo && (
        <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 border border-white/20 text-[8px] text-white shadow-lg">
          🔗
        </div>
      )}

      {card.battlefield?.attachments &&
        card.battlefield.attachments.length > 0 && (
          <div className="absolute -top-2 -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 border border-white/20 text-[8px] text-white shadow-lg">
            {card.battlefield.attachments.length}
          </div>
        )}

      {Object.entries(card.counters).some(([, v]) => v > 0) && (
        <div className="absolute -bottom-1 left-0 right-0 flex flex-wrap gap-0.5 justify-center">
          {Object.entries(card.counters)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => (
              <span
                key={k}
                className="bg-black/80 text-white text-[8px] px-1 rounded-full leading-tight"
              >
                {k === "+1/+1"
                  ? `+${v}`
                  : k === "-1/-1"
                    ? `-${v}`
                    : `${k}:${v}`}
              </span>
            ))}
        </div>
      )}
    </button>
  );
}
