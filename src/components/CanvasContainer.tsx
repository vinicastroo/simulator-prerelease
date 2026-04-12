"use client";

import { useRef } from "react";
import { usePrerelease } from "@/context/PrereleaseContext";
import { DraggableCard } from "./DraggableCard";

/**
 * The infinite canvas that holds all 85 draggable card tokens.
 *
 * The outer div is `position: relative; overflow: hidden` — it serves as the
 * drag-constraint boundary passed to every `DraggableCard`.
 * Cards outside the viewport are still rendered (absolute positioned) but
 * the user can scroll / pan to reach them.
 */
export function CanvasContainer() {
  const { cards } = usePrerelease();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-bg-void"
    >
      {/* Subtle grid pattern for spatial orientation */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(77,99,147,1) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(77,99,147,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {cards.map((placed, i) => (
        <DraggableCard
          key={placed.id}
          placed={placed}
          containerRef={containerRef}
          priority={i < 20}
        />
      ))}
    </div>
  );
}
