"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import Image from "next/image";
import type { RefObject } from "react";
import { usePrerelease, type PlacedCardState } from "@/context/PrereleaseContext";

export const CARD_W = 130;
export const CARD_H = 182;

type Props = {
  placed: PlacedCardState;
  containerRef: RefObject<HTMLDivElement | null>;
  /** Pass true for the first ~20 cards to get priority image loading. */
  priority: boolean;
};

export const DraggableCard = memo(function DraggableCard({
  placed,
  containerRef,
  priority,
}: Props) {
  const { cards, moveCard } = usePrerelease();

  // Motion values drive transform without triggering React re-renders.
  const x = useMotionValue(placed.posX);
  const y = useMotionValue(placed.posY);

  // Local zIndex: elevated on drag start, committed on drag end.
  const [localZ, setLocalZ] = useState(placed.zIndex);

  // Guard prevents external state syncs from fighting an active gesture.
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) x.set(placed.posX);
  }, [placed.posX, x]);

  useEffect(() => {
    if (!isDragging.current) y.set(placed.posY);
  }, [placed.posY, y]);

  useEffect(() => {
    if (!isDragging.current) setLocalZ(placed.zIndex);
  }, [placed.zIndex]);

  const isSoa   = placed.card.set === "SOA";
  const isSPG   = placed.card.set === "SPG";
  const isFoil  = placed.isFoil;
  const isPromo = placed.isPromo;

  // Compute max zIndex at drag start from live context state (O(n) over 85 items).
  function handleDragStart() {
    isDragging.current = true;
    const maxZ = cards.reduce((m, c) => Math.max(m, c.zIndex), 0);
    setLocalZ(maxZ + 1);
  }

  function handleDragEnd() {
    isDragging.current = false;
    moveCard(placed.id, x.get(), y.get(), localZ);
  }

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0}
      // layout="position" smooths position updates from external state changes
      // (e.g. server sync). Framer pauses it during active drag automatically.
      layout="position"
      style={{ x, y, zIndex: localZ, width: CARD_W, height: CARD_H }}
      className="absolute left-0 top-0 cursor-grab active:cursor-grabbing touch-none select-none"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.06, transition: { duration: 0.12 } }}
    >
      {/* ── Card frame ──────────────────────────────────────────────────────── */}
      <div
        className={[
          "relative w-full h-full rounded-[7px] overflow-hidden",
          // SOA (Mystical Archive) — blue ring + cool glow
          isSoa && "ring-1 ring-gold-accent shadow-[0_0_16px_4px_rgba(77,99,147,0.45)]",
          // SPG (Special Guests) — subtle silver ring
          isSPG && !isSoa && "ring-1 ring-white/25 shadow-[0_0_10px_2px_rgba(255,255,255,0.12)]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Card artwork */}
        {placed.card.imagePath ? (
          <Image
            src={placed.card.imagePath}
            alt={placed.card.name}
            fill
            draggable={false}
            priority={priority}
            sizes={`${CARD_W}px`}
            className="object-cover pointer-events-none"
          />
        ) : (
          <PlaceholderFace card={placed.card} />
        )}

        {/* Foil shimmer — all foil cards including promo */}
        {isFoil && (
          <div
            aria-hidden
            className="absolute inset-0 foil-overlay pointer-events-none"
          />
        )}

        {/* Promo extra glow border */}
        {isPromo && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-[7px] pointer-events-none ring-1 ring-gold-accent/70 shadow-[inset_0_0_12px_2px_rgba(77,99,147,0.3)] promo-glow"
          />
        )}

        {/* Rarity pip — bottom-center */}
        <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 pointer-events-none">
          <RarityPip rarity={placed.card.rarity} />
        </div>
      </div>

      {/* ── Promo star badge — outside frame so it's not clipped ──────────── */}
      {isPromo && (
        <div
          aria-label="Promo card"
          className="absolute -top-1.5 -right-1.5 pointer-events-none z-10"
        >
          <StarIcon className="w-5 h-5 text-gold-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
        </div>
      )}

      {/* SOA label badge */}
      {isSoa && (
        <div className="absolute -top-1.5 -left-1.5 pointer-events-none z-10">
          <span className="text-[8px] font-bold text-gold-accent bg-bg-void/80 px-1 rounded leading-none py-0.5 border border-gold-accent/40">
            A
          </span>
        </div>
      )}
    </motion.div>
  );
});

// ── Sub-components ─────────────────────────────────────────────────────────────

function PlaceholderFace({
  card,
}: {
  card: PlacedCardState["card"];
}) {
  return (
    <div className="w-full h-full bg-silverquill-ink flex flex-col items-center justify-center gap-1 p-2">
      <RarityPip rarity={card.rarity} size="lg" />
      <span className="text-gold-accent text-[9px] font-semibold text-center leading-tight mt-1 line-clamp-3">
        {card.name}
      </span>
      <span className="text-white/30 text-[7px] text-center leading-tight">
        {card.typeLine}
      </span>
    </div>
  );
}

const RARITY_RING: Record<string, string> = {
  COMMON:   "bg-white/40",
  UNCOMMON: "bg-slate-400",
  RARE:     "bg-yellow-400",
  MYTHIC:   "bg-orange-500",
};

function RarityPip({
  rarity,
  size = "sm",
}: {
  rarity: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-3 h-3" : "w-1.5 h-1.5";
  return (
    <span
      className={`block rounded-full shadow-md ${dim} ${RARITY_RING[rarity] ?? "bg-white/20"}`}
    />
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
