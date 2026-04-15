"use client";

import { useDndMonitor, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CardBack } from "../CardBack";
import { ModalDropZoneOverlay } from "./ModalDropZones";
import type { CardHoverInfo, DragCardData } from "./types";

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
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
};

// ---------------------------------------------------------------------------
// Draggable card inside the modal
// ---------------------------------------------------------------------------

function ZonePreviewCardButton({
  card,
  zone,
  onHover,
}: {
  card: ZonePreviewCard;
  zone: "graveyard" | "exile";
  onHover?: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `zone-preview-${card.id}`,
      data: {
        cardId: card.id,
        from: zone,
        behavior: "move-from-zone-modal",
      } satisfies DragCardData,
    });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="flex flex-col items-center gap-1.5 rounded-lg bg-transparent p-0 text-inherit cursor-grab active:cursor-grabbing"
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      onMouseEnter={
        onHover
          ? (e) =>
              onHover({ name: card.name, imageUrl: card.imageUrl }, e.currentTarget)
          : undefined
      }
      onMouseLeave={onHover ? () => onHover(null, null) : undefined}
      {...listeners}
      {...attributes}
    >
      <div className="relative h-[167px] w-[120px] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.03] shadow-lg">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={120}
            height={167}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <CardBack className="h-[167px] w-[120px]" />
        )}
      </div>
      <span className="max-w-[120px] truncate text-center text-[10px] text-white/55">
        {card.name}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Modal body — uses useDndMonitor to detect drags from within itself
// ---------------------------------------------------------------------------

function ZonePreviewModalBody({
  zone,
  cards,
  onClose,
  onHoverCard,
}: ZonePreviewModalProps & { zone: "graveyard" | "exile" }) {
  const [isDraggingFromModal, setIsDraggingFromModal] = useState(false);

  useDndMonitor({
    onDragStart(event) {
      const data = event.active.data.current as { behavior?: string } | undefined;
      if (data?.behavior === "move-from-zone-modal") {
        setIsDraggingFromModal(true);
      }
    },
    onDragEnd() {
      setIsDraggingFromModal(false);
    },
    onDragCancel() {
      setIsDraggingFromModal(false);
    },
  });

  const label = zone === "graveyard" ? "Cemitério" : "Exílio";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70">
      {/* Backdrop click closes */}
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label={`Fechar modal de ${label}`}
      />

      <div className="relative flex h-[85vh] w-[min(90vw,900px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1017] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
              {label}
            </p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight text-white">
              Ver cartas
              <span className="ml-2 text-base font-normal text-white/40">
                ({cards.length})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Hint */}
        <div className="border-b border-white/[0.06] px-6 py-2">
          <p className="text-[11px] text-white/35">
            Arraste uma carta para o campo, mão, cemitério ou exílio.
          </p>
        </div>

        {/* Card grid + drop zone overlay */}
        <div className="relative flex-1 overflow-hidden">
          {/* Scrollable grid — dimmed while dragging */}
          <div
            className={`h-full overflow-y-auto p-5 transition-opacity duration-200 ${
              isDraggingFromModal ? "pointer-events-none opacity-20" : ""
            }`}
          >
            {cards.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/30">
                {label} vazio.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {cards.map((card) => (
                  <ZonePreviewCardButton
                    key={card.id}
                    card={card}
                    zone={zone}
                    onHover={onHoverCard}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Drop zones overlay */}
          {isDraggingFromModal && <ModalDropZoneOverlay />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component — guards the null zone case
// ---------------------------------------------------------------------------

export function ZonePreviewModal(props: ZonePreviewModalProps) {
  const { zone, onClose } = props;

  useEffect(() => {
    if (!zone) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zone, onClose]);

  if (!zone) return null;
  return <ZonePreviewModalBody {...props} zone={zone} />;
}
