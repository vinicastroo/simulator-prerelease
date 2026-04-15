"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BattlefieldArrow } from "@/lib/game/types";

type ArrowPoint = {
  x: number;
  y: number;
};

type BattlefieldArrowOverlayProps = {
  arrows: BattlefieldArrow[];
  provisionalArrow?: { start: ArrowPoint; end: ArrowPoint } | null;
  isDrawing?: boolean;
  interactive?: boolean;
  onPointerMove?: (point: ArrowPoint) => void;
  onCanvasClick?: (point: ArrowPoint) => void;
  onDeleteArrow?: (arrowId: string) => void;
};

function toViewportPoint(point: ArrowPoint, width: number, height: number) {
  if (point.x > 1 || point.y > 1) {
    return point;
  }

  return {
    x: point.x * width,
    y: point.y * height,
  };
}

function toNormalizedPoint(clientX: number, clientY: number) {
  const width = Math.max(window.innerWidth, 1);
  const height = Math.max(window.innerHeight, 1);

  return {
    x: clientX / width,
    y: clientY / height,
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
}: BattlefieldArrowOverlayProps) {
  const [hoveredArrowId, setHoveredArrowId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({
    width: 1,
    height: 1,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: Math.max(window.innerWidth, 1),
        height: Math.max(window.innerHeight, 1),
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const renderedArrows = useMemo(
    () =>
      arrows.map((arrow) => ({
        ...arrow,
        startPx: toViewportPoint(arrow.start, viewport.width, viewport.height),
        endPx: toViewportPoint(arrow.end, viewport.width, viewport.height),
      })),
    [arrows, viewport.height, viewport.width],
  );

  const provisionalArrowPx = provisionalArrow
    ? {
        start: toViewportPoint(
          provisionalArrow.start,
          viewport.width,
          viewport.height,
        ),
        end: toViewportPoint(
          provisionalArrow.end,
          viewport.width,
          viewport.height,
        ),
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
            onPointerMove?.(toNormalizedPoint(event.clientX, event.clientY));
          }}
          onClick={(event) => {
            onCanvasClick?.(toNormalizedPoint(event.clientX, event.clientY));
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
