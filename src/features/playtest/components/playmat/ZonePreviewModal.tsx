"use client";

import Image from "next/image";
import { useEffect } from "react";
import { CardBack } from "../CardBack";

export type ZonePreviewCard = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type ZonePreviewModalProps = {
  zone: "graveyard" | "exile" | null;
  cards: ZonePreviewCard[];
  onClose: () => void;
  onHoverCard?: (
    info: { name: string; imageUrl: string | null } | null,
    target: HTMLElement | null,
  ) => void;
};

export function ZonePreviewModal({
  zone,
  cards,
  onClose,
  onHoverCard,
}: ZonePreviewModalProps) {
  useEffect(() => {
    if (!zone) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zone, onClose]);

  if (!zone) return null;

  const label = zone === "graveyard" ? "Cemitério" : "Exílio";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label={`Fechar modal de ${label}`}
      />
      <div className="relative max-h-[80vh] w-[min(90vw,860px)] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-mono text-sm font-medium text-white">
            {label}{" "}
            <span className="text-white/40">({cards.length} cartas)</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white/80"
          >
            fechar ✕
          </button>
        </div>

        {cards.length === 0 ? (
          <p className="text-center text-xs text-white/30">vazio</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {cards.map((card) => (
              <button
                type="button"
                key={card.id}
                className="flex flex-col items-center gap-1"
                onMouseEnter={
                  onHoverCard
                    ? (e) =>
                        onHoverCard(
                          { name: card.name, imageUrl: card.imageUrl },
                          e.currentTarget,
                        )
                    : undefined
                }
                onMouseLeave={
                  onHoverCard ? () => onHoverCard(null, null) : undefined
                }
              >
                <div className="relative h-[209px] w-[150px] overflow-hidden rounded-[8px] border border-white/10">
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      width={150}
                      height={209}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <CardBack className="h-[209px] w-[150px]" />
                  )}
                </div>
                <span className="max-w-[150px] truncate text-center text-[10px] text-white/50">
                  {card.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
