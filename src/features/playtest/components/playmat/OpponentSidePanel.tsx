"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CardHoverInfo } from "./types";

// ─── Types ───────────────────────────────────────────────────────────────────

type StackZoneInfo = {
  topName: string;
  topImageUrl: string | null;
  count: number;
};

type OpponentSidePanelProps = {
  graveyard: StackZoneInfo;
  exile: StackZoneInfo;
  libraryCount: number;
  shuffleCount?: number;
  onViewGraveyard?: () => void;
  onViewExile?: () => void;
  onHoverGraveyardTop?: (
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  onHoverExileTop?: (
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
};

// ─── Internal zone pieces ────────────────────────────────────────────────────

function ZoneShell({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 font-mono">
      {children}
      <div className="flex w-full flex-row items-center justify-between px-0.5">
        <span className="text-xs text-white/60">{label}</span>
        <p className="text-[10px] text-white/40">{count}</p>
      </div>
    </div>
  );
}

function CardSlot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[140px] w-[100px] overflow-hidden rounded-[8px] border border-white/20 bg-white/[0.02]">
      {children}
    </div>
  );
}

// ─── Stack zone (graveyard / exile) ──────────────────────────────────────────

function StackZone({
  label,
  topName,
  topImageUrl,
  count,
  onClick,
  onHoverTop,
}: StackZoneInfo & {
  label: string;
  onClick?: () => void;
  onHoverTop?: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
}) {
  const hoverProps =
    onHoverTop && count > 0
      ? {
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
            onHoverTop(
              { name: topName, imageUrl: topImageUrl },
              e.currentTarget,
            ),
          onMouseLeave: () => onHoverTop(null, null),
        }
      : {};

  const cardContent =
    count > 0 ? (
      topImageUrl ? (
        <Image
          src={topImageUrl}
          alt={topName}
          width={100}
          height={140}
          className="h-full w-full rounded-[8px] border border-white/10 object-cover"
          unoptimized
          {...hoverProps}
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40"
          {...hoverProps}
        >
          {topName}
        </span>
      )
    ) : (
      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40">
        vazio
      </span>
    );

  const inner = (
    <ZoneShell label={label} count={count}>
      <CardSlot>{cardContent}</CardSlot>
    </ZoneShell>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer rounded-[10px] text-left transition-opacity hover:opacity-80 focus:outline-none"
      >
        {inner}
      </button>
    );
  }

  return inner;
}

// ─── Library zone (face-down, read-only) ─────────────────────────────────────

function LibraryZone({
  count,
  shuffleCount = 0,
}: {
  count: number;
  shuffleCount?: number;
}) {
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (shuffleCount === 0) return;
    setIsShuffling(true);
    const id = setTimeout(() => setIsShuffling(false), 1100);
    return () => clearTimeout(id);
  }, [shuffleCount]);

  const faded = count === 0 ? "opacity-30" : "";
  const imgBase = `h-full w-full rounded-[8px] object-cover ${faded}`;

  return (
    <ZoneShell label="Grimório" count={count}>
      <CardSlot>
        {/* Card 1 — fans left */}
        <Image
          src="/magic_card_back.png"
          alt=""
          aria-hidden
          width={100}
          height={140}
          className={`absolute inset-0 ${imgBase} ${isShuffling ? "deck-shuffle-left" : ""}`}
          style={{ transform: "scaleY(-1)" }}
          draggable={false}
          priority={false}
        />
        {/* Card 2 — fans right */}
        <Image
          src="/magic_card_back.png"
          alt=""
          aria-hidden
          width={100}
          height={140}
          className={`absolute inset-0 ${imgBase} ${isShuffling ? "deck-shuffle-right" : ""}`}
          style={{ transform: "scaleY(-1)" }}
          draggable={false}
          priority={false}
        />
        {/* Card 3 — stays still */}
        <Image
          src="/magic_card_back.png"
          alt="Grimório do oponente"
          width={100}
          height={140}
          className={`relative ${imgBase}`}
          style={{ transform: "scaleY(-1)" }}
          draggable={false}
          priority={false}
        />
      </CardSlot>
    </ZoneShell>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

/**
 * Read-only mirror of SideZonePanel for the opponent.
 * Zones displayed in reversed order (Grimório | Exílio | Cemitério)
 * so the layout is a true left-right mirror of the local player's panel.
 */
export function OpponentSidePanel({
  graveyard,
  exile,
  libraryCount,
  shuffleCount,
  onViewGraveyard,
  onViewExile,
  onHoverGraveyardTop,
  onHoverExileTop,
}: OpponentSidePanelProps) {
  return (
    // Altere a tag <aside> para:
    <aside className="flex flex-row gap-3 items-start ml-auto -mt-24 pr-4">
      <LibraryZone count={libraryCount} shuffleCount={shuffleCount} />
      <StackZone
        label="Exílio"
        {...exile}
        onClick={onViewExile}
        onHoverTop={onHoverExileTop}
      />
      <StackZone
        label="Cemitério"
        {...graveyard}
        onClick={onViewGraveyard}
        onHoverTop={onHoverGraveyardTop}
      />
    </aside>
  );
}
