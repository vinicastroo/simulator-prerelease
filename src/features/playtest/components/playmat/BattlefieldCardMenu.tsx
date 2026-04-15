"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BattlefieldCardMenuProps = {
  cardId: string;
  cardName: string;
  counters: Record<string, number>;
  x: number;
  y: number;
  onClose: () => void;
  onAddCounter: (counter: string) => void;
  onRemoveCounter: (counter: string) => void;
  onDuplicate: () => void;
};

const QUICK_COUNTERS = ["+1/+1", "-1/-1", "charge", "loyalty"];

export function BattlefieldCardMenu({
  cardId: _cardId,
  cardName,
  counters,
  x,
  y,
  onClose,
  onAddCounter,
  onRemoveCounter,
  onDuplicate,
}: BattlefieldCardMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [customName, setCustomName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  // Smart positioning — keep menu inside the viewport
  const MENU_W = 240;
  const MENU_H = 360;
  const MARGIN = 12;
  const left = Math.max(
    MARGIN,
    Math.min(x, window.innerWidth - MENU_W - MARGIN),
  );
  const top = Math.max(
    MARGIN,
    Math.min(y, window.innerHeight - MENU_H - MARGIN),
  );

  // Counters to show: quick ones + any existing ones not in the quick list
  const extraCounters = Object.keys(counters).filter(
    (k) => !QUICK_COUNTERS.includes(k) && counters[k] > 0,
  );
  const displayCounters = [
    ...QUICK_COUNTERS,
    ...extraCounters.filter((k) => !QUICK_COUNTERS.includes(k)),
  ];

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9998] flex w-60 flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0e1420]/95 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
      style={{ left, top }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
          Campo de batalha
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white">
          {cardName}
        </p>
      </div>

      {/* Counters */}
      <div className="flex flex-col gap-0.5 px-3 py-2">
        <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
          Contadores
        </p>

        {displayCounters.map((counter) => {
          const value = counters[counter] ?? 0;
          return (
            <div
              key={counter}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-white/[0.05]"
            >
              <span className="font-mono text-xs text-white/80">{counter}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-sm font-bold text-white/70 transition hover:border-white/35 hover:bg-white/[0.1] hover:text-white active:scale-90"
                  onClick={() => onRemoveCounter(counter)}
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-sm font-bold tabular-nums text-white">
                  {value}
                </span>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-sm font-bold text-white/70 transition hover:border-white/35 hover:bg-white/[0.1] hover:text-white active:scale-90"
                  onClick={() => onAddCounter(counter)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}

        {/* Custom counter */}
        <div className="mt-1 flex gap-1.5 px-1">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customName.trim()) {
                onAddCounter(customName.trim());
                setCustomName("");
              }
            }}
            placeholder="Contador personalizado..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none"
          />
          <button
            type="button"
            disabled={!customName.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-sm font-bold text-white/60 transition hover:border-white/30 hover:bg-white/[0.1] hover:text-white disabled:pointer-events-none disabled:opacity-30 active:scale-90"
            onClick={() => {
              if (customName.trim()) {
                onAddCounter(customName.trim());
                setCustomName("");
              }
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Token */}
      <div className="border-t border-white/10 px-3 py-2.5">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
          onClick={() => {
            onDuplicate();
            onClose();
          }}
        >
          <span className="text-base leading-none">⧉</span>
          Duplicar como token
        </button>
      </div>
    </div>,
    document.body,
  );
}
