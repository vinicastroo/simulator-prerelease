"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { usePrerelease, type PlacedCardState } from "@/context/PrereleaseContext";

// ─── Rarity helpers ───────────────────────────────────────────────────────────

const RARITY_DOT: Record<string, string> = {
  COMMON:   "bg-white/40",
  UNCOMMON: "bg-slate-400",
  RARE:     "bg-yellow-400",
  MYTHIC:   "bg-orange-500",
};

const RARITY_ORDER: Record<string, number> = {
  MYTHIC: 0, RARE: 1, UNCOMMON: 2, COMMON: 3,
};

function sortCards(cards: PlacedCardState[]) {
  return [...cards].sort(
    (a, b) =>
      (RARITY_ORDER[a.card.rarity] ?? 4) - (RARITY_ORDER[b.card.rarity] ?? 4) ||
      a.card.cmc - b.card.cmc ||
      a.card.name.localeCompare(b.card.name)
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { cards, isPending, draggingCardId, setDeckZone } = usePrerelease();

  const mainDeck  = sortCards(cards.filter((c) => c.isMainDeck === true));
  const sideboard = sortCards(cards.filter((c) => c.isMainDeck === false));

  const mainZoneRef = useRef<HTMLDivElement>(null);
  const sideZoneRef = useRef<HTMLDivElement>(null);

  // ── Preview tooltip + full overview ──
  const [preview, setPreview] = useState<{ card: PlacedCardState; anchorY: number } | null>(null);
  const [viewing, setViewing] = useState<PlacedCardState | null>(null);

  const handleHover = useCallback((card: PlacedCardState, anchorY: number) => {
    setPreview({ card, anchorY });
  }, []);
  const handleHoverEnd = useCallback(() => setPreview(null), []);
  const handleOpen = useCallback((card: PlacedCardState) => {
    setPreview(null);
    setViewing(card);
  }, []);

  // ── Zone highlight during drag ──
  // pointer events are captured by the dragged card, so CSS :hover doesn't work.
  // We use a global pointermove listener to manually set data-active on zones.
  useEffect(() => {
    if (!draggingCardId) {
      // Reset highlight on drag end
      if (mainZoneRef.current) mainZoneRef.current.dataset.active = "false";
      if (sideZoneRef.current) sideZoneRef.current.dataset.active = "false";
      return;
    }

    const track = (e: PointerEvent) => {
      const main = mainZoneRef.current;
      const side = sideZoneRef.current;
      if (!main || !side) return;

      const mr = main.getBoundingClientRect();
      const sr = side.getBoundingClientRect();
      const { clientX: x, clientY: y } = e;

      main.dataset.active = String(x >= mr.left && x <= mr.right && y >= mr.top && y <= mr.bottom);
      side.dataset.active = String(x >= sr.left && x <= sr.right && y >= sr.top && y <= sr.bottom);
    };

    document.addEventListener("pointermove", track, { passive: true });
    return () => document.removeEventListener("pointermove", track);
  }, [draggingCardId]);

  // ── Drop zone mode ──────────────────────────────────────────────────────────
  if (draggingCardId) {
    return (
      <aside
        style={{ width: 300, minWidth: 300 }}
        className="flex flex-col h-full bg-silverquill-ink border-l border-gold-accent/30"
      >
        <DropZonePanel
          ref={mainZoneRef}
          dataZone="main"
          label="Main Deck"
          count={mainDeck.length}
          colorClass="data-[active=true]:bg-blue-500/15 data-[active=true]:border-blue-400/60"
          icon="⚔️"
        />

        <div className="h-px bg-gold-accent/15 flex-shrink-0" />

        <DropZonePanel
          ref={sideZoneRef}
          dataZone="side"
          label="Sideboard"
          count={sideboard.length}
          colorClass="data-[active=true]:bg-purple-500/15 data-[active=true]:border-purple-400/60"
          icon="🛡️"
        />

        <div className="px-4 py-2 text-[11px] text-white/25 text-center flex-shrink-0">
          Solte sobre uma zona para adicionar
        </div>
      </aside>
    );
  }

  // ── List mode ───────────────────────────────────────────────────────────────
  const landCount  = mainDeck.filter((c) => c.card.typeLine.includes("Land")).length;
  const spellCount = mainDeck.length - landCount;

  return (
    <>
    <aside
      style={{ width: 300, minWidth: 300 }}
      className="flex flex-col h-full bg-silverquill-ink border-l border-gold-accent/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gold-accent/25 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-gold-accent font-semibold tracking-wider text-sm uppercase">
            Deck Builder
          </h2>
          <p className="text-white/30 text-[11px] mt-0.5">
            Arraste cartas para adicionar
          </p>
        </div>
        {isPending && (
          <span className="text-xs text-gold-accent/50 animate-pulse">Salvando…</span>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2.5 border-b border-gold-accent/10 grid grid-cols-4 gap-0 flex-shrink-0">
        <StatCell label="Total" value={mainDeck.length + sideboard.length} />
        <StatCell label="Main"  value={mainDeck.length}  accent />
        <StatCell label="Feitiços" value={spellCount} />
        <StatCell label="Terrenos" value={landCount} />
      </div>

      {/* Scrollable lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Deck section */}
        <SectionHeader
          label="Main Deck"
          count={mainDeck.length}
          ref={mainZoneRef}
          dataZone="main"
        />
        {mainDeck.length === 0 ? (
          <EmptySlot message="Arraste cartas aqui" />
        ) : (
          <ul className="flex flex-col">
            {mainDeck.map((c) => (
              <CardRow
                key={c.id}
                card={c}
                onMove={() => setDeckZone([c.id], false)}
                onRemove={() => setDeckZone([c.id], null)}
                onHover={handleHover}
                onHoverEnd={handleHoverEnd}
                onOpen={handleOpen}
                moveLabel="→ Side"
              />
            ))}
          </ul>
        )}

        {/* Sideboard section */}
        <SectionHeader
          label="Sideboard"
          count={sideboard.length}
          ref={sideZoneRef}
          dataZone="side"
        />
        {sideboard.length === 0 ? (
          <EmptySlot message="Arraste cartas aqui" />
        ) : (
          <ul className="flex flex-col">
            {sideboard.map((c) => (
              <CardRow
                key={c.id}
                card={c}
                onMove={() => setDeckZone([c.id], true)}
                onRemove={() => setDeckZone([c.id], null)}
                moveLabel="→ Main"
              />
            ))}
          </ul>
        )}

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </aside>

    {/* ── Card preview tooltip (fixed, left of sidebar) ── */}
    <AnimatePresence>
      {preview && !viewing && (
        <CardPreviewTooltip card={preview.card} anchorY={preview.anchorY} />
      )}
    </AnimatePresence>

    {/* ── Full-size overview ── */}
    <AnimatePresence>
      {viewing && (
        <CardOverlay card={viewing} onClose={() => setViewing(null)} />
      )}
    </AnimatePresence>
    </>
  );
}

// ─── Drop zone panel (used in drag mode) ─────────────────────────────────────

interface DropZonePanelProps {
  dataZone: string;
  label: string;
  count: number;
  colorClass: string;
  icon: string;
}

const DropZonePanel = forwardRef<HTMLDivElement, DropZonePanelProps>(
  function DropZonePanel({ dataZone, label, count, colorClass, icon }, ref) {
    return (
      <div
        ref={ref}
        data-zone={dataZone}
        data-active="false"
        className={`flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gold-accent/20 m-3 rounded-xl transition-all duration-100 ${colorClass}`}
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-current opacity-40 flex items-center justify-center text-3xl">
          {icon}
        </div>
        <div className="text-center">
          <p className="text-white/80 text-sm font-semibold tracking-wide">{label}</p>
          <p className="text-white/30 text-xs mt-0.5">{count} carta{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
    );
  }
);

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  label: string;
  count: number;
  dataZone?: string;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader({ label, count, dataZone }, ref) {
    return (
      <div
        ref={ref}
        data-zone={dataZone}
        data-active="false"
        className="flex items-center justify-between px-4 py-2 mt-1 sticky top-0 z-10 bg-bg-void/95 backdrop-blur-sm"
      >
        <span className="text-[11px] font-semibold text-gold-accent/70 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[11px] text-white/40 font-mono tabular-nums">
          {count}
        </span>
      </div>
    );
  }
);

// ─── Card row ─────────────────────────────────────────────────────────────────

function CardRow({
  card,
  onMove,
  onRemove,
  moveLabel,
}: {
  card: PlacedCardState;
  onMove: () => void;
  onRemove: () => void;
  moveLabel: string;
}) {
  const colorBar = getColorBar(card.card.colors as string[]);

  return (
    <li className="group flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors">
      {/* Color bar */}
      <div
        className="w-1 h-6 rounded-full flex-shrink-0 opacity-80"
        style={{ background: colorBar }}
      />

      {/* Rarity dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${RARITY_DOT[card.card.rarity] ?? "bg-white/20"}`}
      />

      {/* Name */}
      <span className="flex-1 text-[13px] text-white/75 truncate leading-none">
        {card.card.name}
        {card.isFoil && (
          <span className="ml-1 text-gold-accent text-[10px]">★</span>
        )}
      </span>

      {/* CMC */}
      <span className="text-[11px] text-white/30 font-mono w-4 text-right flex-shrink-0">
        {card.card.cmc > 0 ? card.card.cmc : "—"}
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onMove}
          className="text-[10px] text-gold-accent/60 hover:text-gold-accent transition-colors px-1 py-0.5 rounded hover:bg-gold-accent/10"
        >
          {moveLabel}
        </button>
        <button
          onClick={onRemove}
          title="Remover do deck"
          className="text-[10px] text-white/30 hover:text-red-400 transition-colors w-4 h-4 flex items-center justify-center rounded hover:bg-red-400/10"
        >
          ×
        </button>
      </div>
    </li>
  );
}

// ─── Stat cell ────────────────────────────────────────────────────────────────

function StatCell({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center py-0.5">
      <span className={`text-sm font-bold tabular-nums ${accent ? "text-gold-accent" : "text-white/70"}`}>
        {value}
      </span>
      <span className="text-[9px] text-white/30 uppercase tracking-wider leading-none mt-0.5">
        {label}
      </span>
    </div>
  );
}

// ─── Empty slot ───────────────────────────────────────────────────────────────

function EmptySlot({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-6 px-4">
      <p className="text-white/20 text-xs text-center">{message}</p>
    </div>
  );
}

// ─── Color bar helper ─────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  W: "#f9fafb",
  U: "#3b82f6",
  B: "#6b21a8",
  R: "#ef4444",
  G: "#22c55e",
};

function getColorBar(colors: string[]): string {
  if (colors.length === 0) return "#6b7280"; // colorless
  if (colors.length === 1) return COLOR_MAP[colors[0]] ?? "#6b7280";
  const stops = colors
    .map((c, i) => {
      const pct = (i / (colors.length - 1)) * 100;
      return `${COLOR_MAP[c] ?? "#6b7280"} ${pct}%`;
    })
    .join(", ");
  return `linear-gradient(to bottom, ${stops})`;
}
