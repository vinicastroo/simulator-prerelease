"use client";

import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";

export const MODAL_DROP_ZONES = [
  {
    id: "modal-battlefield",
    label: "Campo de Batalha",
    idleClass: "border-cyan-500/40 bg-cyan-950/60 text-cyan-300/70",
    hoverClass:
      "border-cyan-400 bg-cyan-500/30 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.3)] scale-[1.02]",
  },
  {
    id: "modal-hand",
    label: "Mão",
    idleClass: "border-blue-500/40 bg-blue-950/60 text-blue-300/70",
    hoverClass:
      "border-blue-400 bg-blue-500/30 text-blue-100 shadow-[0_0_28px_rgba(96,165,250,0.3)] scale-[1.02]",
  },
  {
    id: "modal-graveyard",
    label: "Cemitério",
    idleClass: "border-slate-500/40 bg-slate-900/60 text-slate-300/70",
    hoverClass:
      "border-slate-300 bg-slate-500/30 text-slate-100 shadow-[0_0_28px_rgba(148,163,184,0.25)] scale-[1.02]",
  },
  {
    id: "modal-exile",
    label: "Exílio",
    idleClass: "border-purple-500/40 bg-purple-950/60 text-purple-300/70",
    hoverClass:
      "border-purple-400 bg-purple-500/30 text-purple-100 shadow-[0_0_28px_rgba(192,132,252,0.3)] scale-[1.02]",
  },
  {
    id: "modal-cancel",
    label: "Escolher outra carta",
    idleClass: "border-white/20 bg-white/[0.04] text-white/40",
    hoverClass: "border-white/40 bg-white/[0.09] text-white/70 scale-[1.01]",
  },
] as const;

export const ModalDropZone = memo(function ModalDropZone({
  id,
  label,
  idleClass,
  hoverClass,
}: (typeof MODAL_DROP_ZONES)[number]) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex select-none items-center justify-center rounded-2xl border-2 p-4 text-center transition-all duration-150 ${
        isOver ? hoverClass : idleClass
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
});

/** Renders the 2×2 grid + cancel row used by both library and zone-preview modals. */
export const ModalDropZoneOverlay = memo(function ModalDropZoneOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-5">
      <div className="grid flex-1 grid-cols-2 gap-3">
        {MODAL_DROP_ZONES.slice(0, 4).map((zone) => (
          <ModalDropZone key={zone.id} {...zone} />
        ))}
      </div>
      <ModalDropZone {...MODAL_DROP_ZONES[4]} />
    </div>
  );
});
