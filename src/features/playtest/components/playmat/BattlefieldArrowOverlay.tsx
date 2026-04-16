"use client";

import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BattlefieldArrow } from "@/lib/game/types";
import { BATTLEFIELD_CANVAS_SIZE } from "./constants";

type ArrowPoint = {
  x: number;
  y: number;
};

export type ArrowCoordinateSpace = "canvas" | "viewport";

type BattlefieldArrowOverlayProps = {
  arrows: BattlefieldArrow[];
  provisionalArrow?: { start: ArrowPoint; end: ArrowPoint } | null;
  isDrawing?: boolean;
  interactive?: boolean;
  onPointerMove?: (point: ArrowPoint) => void;
  onCanvasClick?: (point: ArrowPoint) => void;
  onDeleteArrow?: (arrowId: string) => void;
  /** Outer container element of the battlefield (no CSS transform applied). */
  containerEl?: HTMLDivElement | null;
  /** Current pan offset applied to the battlefield canvas. */
  pan?: ArrowPoint;
  /** Current zoom scale applied to the battlefield canvas. */
  zoom?: number;
  coordinateSpace?: ArrowCoordinateSpace;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

/**
 * Convert a viewport click to canvas-normalized coordinates (0–1 fraction of
 * BATTLEFIELD_CANVAS_SIZE). Accounts for the container's position on screen
 * and the pan/zoom transform applied to the canvas inside it.
 */
export function toCanvasNormalized(
  clientX: number,
  clientY: number,
  containerEl: HTMLDivElement | null | undefined,
  pan: ArrowPoint,
  zoom: number,
): ArrowPoint | null {
  if (!containerEl) return null;
  const rect = containerEl.getBoundingClientRect();
  return {
    x: clamp01((clientX - rect.left - pan.x) / zoom / BATTLEFIELD_CANVAS_SIZE),
    y: clamp01((clientY - rect.top - pan.y) / zoom / BATTLEFIELD_CANVAS_SIZE),
  };
}

export function toViewportNormalized(
  clientX: number,
  clientY: number,
  containerEl?: HTMLDivElement | null,
): ArrowPoint {
  if (!containerEl) {
    return {
      x: clamp01(clientX / Math.max(window.innerWidth, 1)),
      y: clamp01(clientY / Math.max(window.innerHeight, 1)),
    };
  }

  const rect = containerEl.getBoundingClientRect();
  return {
    x: clamp01((clientX - rect.left) / Math.max(rect.width, 1)),
    y: clamp01((clientY - rect.top) / Math.max(rect.height, 1)),
  };
}

/**
 * Convert a canvas-normalized point back to viewport pixels for SVG rendering.
 * Falls back to viewport-fraction behavior when no container is available
 * (keeps existing arrows readable during first render or in tests).
 */
function toViewportPx(
  point: ArrowPoint,
  containerEl: HTMLDivElement | null | undefined,
  pan: ArrowPoint,
  zoom: number,
): ArrowPoint {
  if (!containerEl) {
    return {
      x: point.x * window.innerWidth,
      y: point.y * window.innerHeight,
    };
  }
  const rect = containerEl.getBoundingClientRect();
  return {
    x: point.x * BATTLEFIELD_CANVAS_SIZE * zoom + pan.x + rect.left,
    y: point.y * BATTLEFIELD_CANVAS_SIZE * zoom + pan.y + rect.top,
  };
}

function toContainerViewportPx(
  point: ArrowPoint,
  containerEl?: HTMLDivElement | null,
): ArrowPoint {
  if (!containerEl) {
    return {
      x: point.x * window.innerWidth,
      y: point.y * window.innerHeight,
    };
  }

  const rect = containerEl.getBoundingClientRect();
  return {
    x: rect.left + point.x * rect.width,
    y: rect.top + point.y * rect.height,
  };
}

export function BattlefieldArrowOverlay({
  arrows,
  provisionalArrow = null,
  isDrawing = false,
  interactive = false,
  onPointerMove,
  onCanvasClick,
  onDeleteArrow,
  containerEl,
  pan = { x: 0, y: 0 },
  zoom = 1,
  coordinateSpace = "canvas",
}: BattlefieldArrowOverlayProps) {
  const [hoveredArrowId, setHoveredArrowId] = useState<string | null>(null);

  const renderedArrows = useMemo(
    () =>
      arrows.map((arrow) => ({
        ...arrow,
        startPx:
          coordinateSpace === "viewport"
            ? toContainerViewportPx(arrow.start, containerEl)
            : toViewportPx(arrow.start, containerEl, pan, zoom),
        endPx:
          coordinateSpace === "viewport"
            ? toContainerViewportPx(arrow.end, containerEl)
            : toViewportPx(arrow.end, containerEl, pan, zoom),
      })),
    [arrows, containerEl, coordinateSpace, pan, zoom],
  );

  const provisionalArrowPx = provisionalArrow
    ? {
        start:
          coordinateSpace === "viewport"
            ? toContainerViewportPx(provisionalArrow.start, containerEl)
            : toViewportPx(provisionalArrow.start, containerEl, pan, zoom),
        end:
          coordinateSpace === "viewport"
            ? toContainerViewportPx(provisionalArrow.end, containerEl)
            : toViewportPx(provisionalArrow.end, containerEl, pan, zoom),
      }
    : null;

  if (
    renderedArrows.length === 0 &&
    !provisionalArrowPx &&
    !(interactive && isDrawing)
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[560]">
      {interactive && isDrawing ? (
        <button
          type="button"
          aria-label="Desenhar seta"
          className="cursor-arrow-mode pointer-events-auto absolute inset-0 appearance-none border-0 bg-transparent p-0"
          onMouseMove={(event) => {
            const pt =
              coordinateSpace === "viewport"
                ? toViewportNormalized(
                    event.clientX,
                    event.clientY,
                    containerEl,
                  )
                : toCanvasNormalized(
                    event.clientX,
                    event.clientY,
                    containerEl,
                    pan,
                    zoom,
                  );
            if (pt) onPointerMove?.(pt);
          }}
          onClick={(event) => {
            const pt =
              coordinateSpace === "viewport"
                ? toViewportNormalized(
                    event.clientX,
                    event.clientY,
                    containerEl,
                  )
                : toCanvasNormalized(
                    event.clientX,
                    event.clientY,
                    containerEl,
                    pan,
                    zoom,
                  );
            if (pt) onCanvasClick?.(pt);
          }}
        />
      ) : null}

      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <marker
            id="battlefield-arrowhead-global"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" />
          </marker>
          <marker
            id="battlefield-arrowhead-global-preview"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
        </defs>

        {renderedArrows.map((arrow) => (
          <g key={arrow.id}>
            <line
              x1={arrow.startPx.x}
              y1={arrow.startPx.y}
              x2={arrow.endPx.x}
              y2={arrow.endPx.y}
              stroke="#facc15"
              strokeWidth="5"
              strokeLinecap="round"
              markerEnd="url(#battlefield-arrowhead-global)"
              opacity="0.95"
            />
            {onDeleteArrow ? (
              /* biome-ignore lint/a11y/noStaticElementInteractions: svg hover target for arrow delete affordance */
              <line
                x1={arrow.startPx.x}
                y1={arrow.startPx.y}
                x2={arrow.endPx.x}
                y2={arrow.endPx.y}
                stroke="transparent"
                strokeWidth="22"
                strokeLinecap="round"
                className="pointer-events-auto"
                onMouseEnter={() => setHoveredArrowId(arrow.id)}
                onMouseLeave={() =>
                  setHoveredArrowId((current) =>
                    current === arrow.id ? null : current,
                  )
                }
              />
            ) : null}
          </g>
        ))}

        {provisionalArrowPx ? (
          <line
            x1={provisionalArrowPx.start.x}
            y1={provisionalArrowPx.start.y}
            x2={provisionalArrowPx.end.x}
            y2={provisionalArrowPx.end.y}
            stroke="#38bdf8"
            strokeWidth="5"
            strokeDasharray="12 8"
            strokeLinecap="round"
            markerEnd="url(#battlefield-arrowhead-global-preview)"
            opacity="0.95"
          />
        ) : null}
      </svg>

      {renderedArrows.map((arrow) => {
        if (hoveredArrowId !== arrow.id || !onDeleteArrow) return null;

        const midpointX = (arrow.startPx.x + arrow.endPx.x) / 2;
        const midpointY = (arrow.startPx.y + arrow.endPx.y) / 2;

        return (
          <button
            key={`delete-${arrow.id}`}
            type="button"
            className="pointer-events-auto absolute z-[1] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-300/30 bg-[#200b0b]/90 text-red-200 shadow-lg transition hover:bg-[#341010] hover:text-white"
            style={{ left: midpointX, top: midpointY }}
            onClick={() => onDeleteArrow(arrow.id)}
            onMouseEnter={() => setHoveredArrowId(arrow.id)}
            onMouseLeave={() => setHoveredArrowId(null)}
          >
            <Trash2 className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
