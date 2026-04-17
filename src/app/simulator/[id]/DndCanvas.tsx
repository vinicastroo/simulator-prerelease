"use client";

import {
  AnimatePresence,
  type MotionValue,
  motion,
  type PanInfo,
  useMotionValue,
} from "framer-motion";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type PlacedCardState,
  usePrerelease,
} from "@/context/PrereleaseContext";

// ─── Constants ────────────────────────────────────────────────────────────────

export const WORLD_W = 3000;
export const WORLD_H = 3000;
export const CARD_W = 130;
export const CARD_H = 182;
const CANVAS_PAD = 200000;

const EPOCH_2024_S = 1_704_067_200;
function timeBasedZ(): number {
  return Math.floor(Date.now() / 1000) - EPOCH_2024_S;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── CustomEvent types ────────────────────────────────────────────────────────

interface MassDragStartPayload {
  leaderId: string;
}
interface MassDragMovePayload {
  leaderId: string;
  offsetX: number;
  offsetY: number;
}
interface MassDragEndPayload {
  leaderId: string;
  offsetX: number;
  offsetY: number;
  snapGrid: number | null;
}
interface MassDragCancelPayload {
  leaderId: string;
}

declare global {
  interface WindowEventMap {
    "mass-drag-start": CustomEvent<MassDragStartPayload>;
    "mass-drag-move": CustomEvent<MassDragMovePayload>;
    "mass-drag-end": CustomEvent<MassDragEndPayload>;
    "mass-drag-cancel": CustomEvent<MassDragCancelPayload>;
  }
}

// ─── Card registry ────────────────────────────────────────────────────────────

type CardEntry = { x: MotionValue<number>; y: MotionValue<number> };
type CardRegistry = Map<string, CardEntry>;

// ─── Lasso helpers ────────────────────────────────────────────────────────────

interface LassoRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsIntersect(lasso: LassoRect, card: PlacedCardState): boolean {
  return !(
    lasso.x + lasso.w < card.posX ||
    lasso.x > card.posX + CARD_W ||
    lasso.y + lasso.h < card.posY ||
    lasso.y > card.posY + CARD_H
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolMode = "select" | "hand";
type CanvasSortMode = "cmc" | "color" | "rarity";
type ViewMode = "canvas" | "gallery" | "list";

interface ZoomProps {
  scale: number;
  setScale: (s: number) => void;
  toolMode: ToolMode;
  setToolMode: (m: ToolMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSort: (mode: CanvasSortMode) => void;
}

interface DndCardProps {
  placed: PlacedCardState;
  priority: boolean;
  isSelected: boolean;
  selectedIds: ReadonlySet<string>;
  scale: number;
  registry: React.MutableRefObject<CardRegistry>;
  onSelect: (id: string, multi: boolean) => void;
  onOpenOverview: (placed: PlacedCardState) => void;
  onGroupDragEnd: (
    leaderId: string,
    clientPos: { x: number; y: number },
    startPos: { x: number; y: number },
  ) => void;
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ZoomControls({
  scale,
  setScale,
  toolMode,
  setToolMode,
  viewMode,
  setViewMode,
  onSort,
}: ZoomProps) {
  const isCanvasView = viewMode === "canvas";

  return (
    <div className="fixed bottom-6 left-6 z-[150000000] flex flex-col gap-2 rounded-xl border border-[#30476f]/55 bg-[#0d1015]/88 p-2 backdrop-blur-md shadow-2xl">
      <button
        type="button"
        title="Visualização canvas"
        onClick={() => setViewMode("canvas")}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          viewMode === "canvas"
            ? "bg-[#233455]/55 text-[#d8e4ff]"
            : "text-[#6f84b4] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
        }`}
      >
        <CanvasIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Visualização grade"
        onClick={() => setViewMode("gallery")}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          viewMode === "gallery"
            ? "bg-[#233455]/55 text-[#d8e4ff]"
            : "text-[#6f84b4] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
        }`}
      >
        <GridIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Visualização lista"
        onClick={() => setViewMode("list")}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          viewMode === "list"
            ? "bg-[#233455]/55 text-[#d8e4ff]"
            : "text-[#6f84b4] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
        }`}
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <div className="mx-2 h-[1px] bg-[#30476f]/45" />
      <button
        type="button"
        disabled={!isCanvasView}
        onClick={() => setScale(Math.min(scale + 0.2, 2.5))}
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold transition-colors ${
          isCanvasView
            ? "text-[#8ea4d6] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
            : "text-white/20 cursor-not-allowed"
        }`}
      >
        +
      </button>
      <div className="mx-2 h-[1px] bg-[#30476f]/45" />
      <button
        type="button"
        disabled={!isCanvasView}
        onClick={() => setScale(Math.max(scale - 0.2, 0.4))}
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold transition-colors ${
          isCanvasView
            ? "text-[#8ea4d6] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
            : "text-white/20 cursor-not-allowed"
        }`}
      >
        −
      </button>
      <div className="mt-1 text-center font-mono text-[10px] text-[#7f95c9]">
        {isCanvasView ? `${Math.round(scale * 100)}%` : "GRID"}
      </div>
      <div className="mx-2 h-[1px] bg-[#30476f]/45" />
      <button
        type="button"
        title="Selecionar (V)"
        disabled={viewMode === "gallery"}
        onClick={() => setToolMode("select")}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          viewMode === "gallery"
            ? "text-white/20 cursor-not-allowed"
            : toolMode === "select"
              ? "bg-[#233455]/55 text-[#b8c6e6]"
              : "text-[#6f84b4] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
        }`}
      >
        <CursorIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Mover canvas (H)"
        disabled={viewMode === "gallery"}
        onClick={() => setToolMode(toolMode === "hand" ? "select" : "hand")}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-base ${
          viewMode === "gallery"
            ? "text-white/20 cursor-not-allowed"
            : toolMode === "hand"
              ? "bg-[#233455]/55 text-[#b8c6e6]"
              : "text-[#6f84b4] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
        }`}
      >
        ✋
      </button>
      <div className="mx-2 h-[1px] bg-[#30476f]/45" />
      <button
        type="button"
        title="Ordenar por custo"
        onClick={() => onSort("cmc")}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wide text-[#7f95c9] transition-colors hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
      >
        CMC
      </button>
      <button
        type="button"
        title="Ordenar por cor"
        onClick={() => onSort("color")}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wide text-[#7f95c9] transition-colors hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
      >
        Cor
      </button>
      <button
        type="button"
        title="Ordenar por raridade"
        onClick={() => onSort("rarity")}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-[9px] font-black uppercase tracking-wide text-[#7f95c9] transition-colors hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
      >
        Rar
      </button>
    </div>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export function DndCanvas() {
  const { cards, moveCard, moveCards } = usePrerelease();
  const { setDeckZone, setDraggingCard } = usePrerelease();
  const canvasCards = cards.filter((card) => card.isMainDeck === null);

  const [scale, setScale] = useState(1);
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [gallerySortMode, setGallerySortMode] = useState<CanvasSortMode>("cmc");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [viewingCard, setViewingCard] = useState<PlacedCardState | null>(null);

  // Pan offset (MotionValues → no re-renders while panning)
  // Initial X offset pushes the world past the toolbar (~80px wide at left-6)
  const worldX = useMotionValue(104);
  const worldY = useMotionValue(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const registry = useRef<CardRegistry>(new Map());

  // Stable refs for callbacks
  const scaleRef = useRef(scale);
  const selectedIdsRef = useRef(selectedIds);
  const toolModeRef = useRef(toolMode);
  const spaceHeld = useRef(false);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);
  useEffect(() => {
    toolModeRef.current = toolMode;
  }, [toolMode]);

  // Lasso state — all in refs, zero re-renders during mouse move
  const lassoActive = useRef(false);
  const lassoStart = useRef({ x: 0, y: 0 });
  const lassoEl = useRef<HTMLDivElement>(null);
  const rAFId = useRef(0);

  // Pan state
  const isPanning = useRef(false);
  const panStart = useRef({ clientX: 0, clientY: 0, wx: 0, wy: 0 });

  // ── Keyboard: Space = temporary hand tool, H = toggle hand, V/Escape = select ──
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        spaceHeld.current = true;
      }
      if (e.code === "KeyH")
        setToolMode((m) => (m === "hand" ? "select" : "hand"));
      if (e.code === "KeyV" || e.code === "Escape") setToolMode("select");
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceHeld.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ── Wheel: Ctrl/Cmd = zoom-to-cursor, else = pan ──
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && worldRef.current) {
        const vpRect = vp.getBoundingClientRect();
        const worldRect = worldRef.current.getBoundingClientRect();
        const currentScale = worldRect.width / WORLD_W;
        const newScale = clamp(currentScale - e.deltaY * 0.0015, 0.4, 2.5);

        // Zoom towards cursor: keep the world point under cursor fixed
        const cursorVpX = e.clientX - vpRect.left;
        const cursorVpY = e.clientY - vpRect.top;
        const originX = worldRect.left - vpRect.left;
        const originY = worldRect.top - vpRect.top;
        const wPointX = (cursorVpX - originX) / currentScale;
        const wPointY = (cursorVpY - originY) / currentScale;
        worldX.set(cursorVpX - wPointX * newScale);
        worldY.set(cursorVpY - wPointY * newScale);
        setScale(newScale);
      } else {
        worldX.set(worldX.get() - e.deltaX);
        worldY.set(worldY.get() - e.deltaY);
      }
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [worldX, worldY]);

  // ── Client → world coords ──
  const toWorld = useCallback((clientX: number, clientY: number) => {
    if (!worldRef.current) return { x: 0, y: 0 };
    const rect = worldRef.current.getBoundingClientRect();
    const actualScale = rect.width / WORLD_W;
    return {
      x: (clientX - rect.left) / actualScale,
      y: (clientY - rect.top) / actualScale,
    };
  }, []);

  // ── Background pointer handlers (pan or lasso) ──
  const onWorldPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const isHandMode =
        toolModeRef.current === "hand" ||
        spaceHeld.current ||
        e.ctrlKey ||
        e.metaKey;
      e.currentTarget.setPointerCapture(e.pointerId);

      if (isHandMode) {
        isPanning.current = true;
        panStart.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          wx: worldX.get(),
          wy: worldY.get(),
        };
        return;
      }

      const pos = toWorld(e.clientX, e.clientY);
      lassoActive.current = true;
      lassoStart.current = pos;
      if (lassoEl.current) {
        lassoEl.current.style.cssText = `display:block;left:${pos.x * scaleRef.current}px;top:${pos.y * scaleRef.current}px;width:0;height:0`;
      }
    },
    [toWorld, worldX, worldY],
  );

  const onWorldPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isPanning.current) {
        worldX.set(
          panStart.current.wx + (e.clientX - panStart.current.clientX),
        );
        worldY.set(
          panStart.current.wy + (e.clientY - panStart.current.clientY),
        );
        return;
      }
      if (!lassoActive.current) return;

      cancelAnimationFrame(rAFId.current);
      const cx = e.clientX;
      const cy = e.clientY;
      rAFId.current = requestAnimationFrame(() => {
        const curr = toWorld(cx, cy);
        const x = Math.min(curr.x, lassoStart.current.x);
        const y = Math.min(curr.y, lassoStart.current.y);
        const w = Math.abs(curr.x - lassoStart.current.x);
        const h = Math.abs(curr.y - lassoStart.current.y);
        if (lassoEl.current) {
          const scale = scaleRef.current;
          lassoEl.current.style.cssText = `display:block;left:${x * scale}px;top:${y * scale}px;width:${w * scale}px;height:${h * scale}px`;
        }
      });
    },
    [toWorld, worldX, worldY],
  );

  const onWorldPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isPanning.current) {
        isPanning.current = false;
        return;
      }
      if (!lassoActive.current) return;

      cancelAnimationFrame(rAFId.current);
      lassoActive.current = false;
      if (lassoEl.current) lassoEl.current.style.display = "none";

      const curr = toWorld(e.clientX, e.clientY);
      const lasso: LassoRect = {
        x: Math.min(curr.x, lassoStart.current.x),
        y: Math.min(curr.y, lassoStart.current.y),
        w: Math.abs(curr.x - lassoStart.current.x),
        h: Math.abs(curr.y - lassoStart.current.y),
      };

      if (lasso.w < 4 && lasso.h < 4) {
        setSelectedIds(new Set());
        return;
      }
      setSelectedIds(
        new Set(
          canvasCards.filter((c) => rectsIntersect(lasso, c)).map((c) => c.id),
        ),
      );
    },
    [canvasCards, toWorld],
  );

  // ── Card selection ──
  const handleCardSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds((prev) => {
      if (multi) {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }
      return new Set([id]);
    });
  }, []);

  const handleOpenOverview = useCallback((placed: PlacedCardState) => {
    setViewingCard(placed);
  }, []);

  const handleSortCanvas = useCallback(
    (mode: CanvasSortMode) => {
      const sorted = sortPlacedCards(canvasCards, mode);

      const cols = 7;
      const gapX = 22;
      const gapY = 28;
      const startX = 72;
      const startY = 72;
      const nextZ = timeBasedZ();

      moveCards(
        sorted.map((card, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
            id: card.id,
            posX: startX + col * (CARD_W + gapX),
            posY: startY + row * (CARD_H + gapY),
            zIndex: nextZ + index,
          };
        }),
      );
    },
    [canvasCards, moveCards],
  );

  const handleSort = useCallback(
    (mode: CanvasSortMode) => {
      if (viewMode === "gallery") {
        setGallerySortMode(mode);
        return;
      }

      handleSortCanvas(mode);
    },
    [handleSortCanvas, viewMode],
  );

  const galleryCards = sortPlacedCards(canvasCards, gallerySortMode);

  const handleSidebarDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const ids = getDraggedPlacedCardIds(e.dataTransfer);
      if (ids.length === 0) return;

      e.preventDefault();
      const pos = toWorld(e.clientX, e.clientY);
      const maxZ =
        cards.reduce((acc, card) => Math.max(acc, card.zIndex), 0) + 1;
      const gapX = 22;

      setDeckZone(ids, null);

      if (ids.length === 1) {
        const posX = pos.x - CARD_W / 2;
        const posY = pos.y - CARD_H / 2;
        moveCard(ids[0], posX, posY, maxZ);
      } else {
        moveCards(
          ids.map((id, index) => ({
            id,
            posX: pos.x - CARD_W / 2 + index * gapX,
            posY: pos.y - CARD_H / 2,
            zIndex: maxZ + index,
          })),
        );
      }

      setDraggingCard(null);
    },
    [cards, moveCard, moveCards, setDeckZone, setDraggingCard, toWorld],
  );

  const handleGroupDragEnd = useCallback(
    (
      leaderId: string,
      clientPos: { x: number; y: number },
      startPos: { x: number; y: number },
    ) => {
      const el = document.elementFromPoint(clientPos.x, clientPos.y);
      const zone = el?.closest("[data-zone]")?.getAttribute("data-zone");

      const ids = Array.from(selectedIdsRef.current);

      if (zone === "main") {
        setDeckZone(ids, true);
        setDraggingCard(null);
        return;
      }
      if (zone === "side") {
        setDeckZone(ids, false);
        setDraggingCard(null);
        return;
      }

      const updates = ids.map((id) => {
        const entry = registry.current.get(id);
        if (!entry) {
          return {
            id,
            posX: startPos.x,
            posY: startPos.y,
            zIndex: timeBasedZ(),
          };
        }
        return {
          id,
          posX: entry.x.get() / scaleRef.current,
          posY: entry.y.get() / scaleRef.current,
          zIndex: id === leaderId ? timeBasedZ() : timeBasedZ() - 1,
        };
      });

      moveCards(updates);
      setDraggingCard(null);
    },
    [moveCards, setDeckZone, setDraggingCard],
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-void">
      <Button
        asChild
        variant="ghost"
        size="icon-lg"
        className="fixed left-6 top-6 z-[150000000] rounded-xl border border-[#30476f]/55 bg-[#0d1015]/88 text-[#8ea4d6] shadow-2xl backdrop-blur-md hover:bg-[#233455]/45 hover:text-[#d8e4ff]"
      >
        <Link
          href="/"
          aria-label="Voltar para a home"
          title="Voltar para a home"
        >
          <Home className="h-5 w-5" />
        </Link>
      </Button>

      {viewMode === "canvas" ? (
        <div
          ref={viewportRef}
          className={`relative h-full w-full overflow-hidden ${toolMode === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
        >
          <motion.div
            ref={worldRef}
            style={{
              x: worldX,
              y: worldY,
              width: WORLD_W * scale,
              height: WORLD_H * scale,
            }}
            className="relative"
            onPointerDown={onWorldPointerDown}
            onPointerMove={onWorldPointerMove}
            onPointerUp={onWorldPointerUp}
            onDragOver={(e) => {
              if (
                e.dataTransfer.types.includes("application/x-placed-card-id") ||
                e.dataTransfer.types.includes("application/x-placed-card-ids")
              ) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={handleSidebarDrop}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                left: CANVAS_PAD * scale * -1,
                top: CANVAS_PAD * scale * -1,
                width: (WORLD_W + CANVAS_PAD * 4) * scale,
                height: (WORLD_H + CANVAS_PAD * 4) * scale,
                backgroundImage: `
                  linear-gradient(to right, rgba(77,99,147,0.08) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(77,99,147,0.08) 1px, transparent 1px)
                `,
                backgroundSize: `${32 * scale}px ${32 * scale}px`,
              }}
            />

            {canvasCards.map((placed, i) => (
              <DndCard
                key={placed.id}
                placed={placed}
                priority={i < 24}
                isSelected={selectedIds.has(placed.id)}
                selectedIds={selectedIds}
                scale={scale}
                registry={registry}
                onSelect={handleCardSelect}
                onOpenOverview={handleOpenOverview}
                onGroupDragEnd={handleGroupDragEnd}
              />
            ))}

            <div
              ref={lassoEl}
              className="absolute hidden pointer-events-none rounded-sm border border-[#4d6393]/70 bg-[#4d6393]/12"
            />
          </motion.div>
        </div>
      ) : (
        // Gallery / List — drop here = remove from deck, card returns to canvas
        /* biome-ignore lint/a11y/noStaticElementInteractions: HTML5 drag-and-drop zone has no equivalent ARIA interactive role */
        <div
          className="h-full w-full"
          onDragOver={(e) => {
            if (
              e.dataTransfer.types.includes("application/x-placed-card-id") ||
              e.dataTransfer.types.includes("application/x-placed-card-ids")
            ) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDrop={(e) => {
            const ids = getDraggedPlacedCardIds(e.dataTransfer);
            if (ids.length === 0) return;
            e.preventDefault();
            setDeckZone(ids, null);
            setDraggingCard(null);
          }}
        >
          {viewMode === "gallery" ? (
            <GalleryView
              cards={galleryCards}
              onOpenOverview={handleOpenOverview}
            />
          ) : (
            <ListView
              cards={galleryCards}
              sortMode={gallerySortMode}
              toolMode={toolMode}
              selectedIds={selectedIds}
              onSelect={handleCardSelect}
              onOpenOverview={handleOpenOverview}
            />
          )}
        </div>
      )}

      <ZoomControls
        scale={scale}
        setScale={setScale}
        toolMode={toolMode}
        setToolMode={setToolMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSort={handleSort}
      />

      <AnimatePresence>
        {viewingCard && (
          <CardOverview
            placed={viewingCard}
            onClose={() => setViewingCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getDraggedPlacedCardIds(dataTransfer: DataTransfer): string[] {
  const rawIds = dataTransfer.getData("application/x-placed-card-ids");
  if (rawIds) {
    try {
      const parsed = JSON.parse(rawIds);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        );
      }
    } catch {
      // ignore and fallback
    }
  }

  const id = dataTransfer.getData("application/x-placed-card-id");
  return id ? [id] : [];
}

function sortPlacedCards(cards: PlacedCardState[], mode: CanvasSortMode) {
  const rarityRank: Record<string, number> = {
    MYTHIC: 0,
    RARE: 1,
    UNCOMMON: 2,
    COMMON: 3,
  };

  return [...cards].sort((a, b) => {
    if (mode === "cmc") {
      return a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name);
    }
    if (mode === "color") {
      const left = a.card.colors.join("") || "Z";
      const right = b.card.colors.join("") || "Z";
      return (
        left.localeCompare(right) ||
        a.card.cmc - b.card.cmc ||
        a.card.name.localeCompare(b.card.name)
      );
    }
    return (
      (rarityRank[a.card.rarity] ?? 9) - (rarityRank[b.card.rarity] ?? 9) ||
      a.card.cmc - b.card.cmc ||
      a.card.name.localeCompare(b.card.name)
    );
  });
}

function GalleryView({
  cards,
  onOpenOverview,
}: {
  cards: PlacedCardState[];
  onOpenOverview: (placed: PlacedCardState) => void;
}) {
  const { setDraggingCard } = usePrerelease();

  return (
    <div className="h-full w-full overflow-y-auto px-20 py-8 [scrollbar-color:#31456f_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#31456f]/80 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f95c9]">
              Card Gallery
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[0.08em] text-[#d8e4ff]">
              Cartas abertas
            </h2>
          </div>
          <div className="rounded-full border border-[#30476f]/45 bg-[#11161d]/88 px-3 py-1.5 font-mono text-[11px] text-white/46">
            {cards.length} cartas no canvas
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[30px] border border-dashed border-[#30476f]/40 bg-[#10151b]/70 text-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7f95c9]">
                Sem cartas
              </p>
              <p className="mt-2 text-sm text-white/35">
                Todas as cartas abertas ja estao no main deck ou sideboard.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {cards.map((placed, index) => (
              <Button
                key={placed.id}
                variant="ghost"
                draggable
                onClick={() => onOpenOverview(placed)}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/x-placed-card-id",
                    placed.id,
                  );
                  e.dataTransfer.setData(
                    "application/x-placed-card-ids",
                    JSON.stringify([placed.id]),
                  );
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingCard(placed.id);
                }}
                onDragEnd={() => setDraggingCard(null)}
                className="group relative h-auto w-full cursor-grab p-0 transition-all duration-150 hover:-translate-y-0.5 hover:bg-transparent active:cursor-grabbing"
              >
                <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
                  <Image
                    src={placed.card.imagePath}
                    alt={placed.card.name}
                    fill
                    priority={index < 10}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    draggable={false}
                  />
                  {placed.isFoil && (
                    <div className="absolute inset-0 foil-overlay pointer-events-none opacity-50" />
                  )}
                  {placed.isPromo && <StarBadge />}
                  {placed.card.set === "SOA" && <ArchiveBadge />}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ListView ────────────────────────────────────────────────────────────────

const COLOR_LABEL: Record<string, string> = {
  W: "Branco",
  U: "Azul",
  B: "Preto",
  R: "Vermelho",
  G: "Verde",
};

const RARITY_COLOR: Record<string, string> = {
  MYTHIC: "#f97316",
  RARE: "#eab308",
  UNCOMMON: "#94a3b8",
  COMMON: "#64748b",
};

// Column order: W U B R G Multi Colorless Land
const LIST_COLOR_ORDER = ["W", "U", "B", "R", "G", "Multi", "Incolor", "Terra"];

const LIST_COLUMN_ACCENT: Record<string, string> = {
  W: "#e8d9a0",
  U: "#5b8fd4",
  B: "#9f82c4",
  R: "#d96444",
  G: "#5aaa6a",
  Multi: "#d4a83a",
  Incolor: "#8098b8",
  Terra: "#9b7a5c",
};

function listColorKey(placed: PlacedCardState): string {
  if (placed.card.typeLine.includes("Land")) return "Terra";
  const c = placed.card.colors;
  if (c.length === 0) return "Incolor";
  if (c.length > 1) return "Multi";
  return c[0];
}

const STACK_OFFSET = 38; // px revealed per card

const PREVIEW_W = 240;
const PREVIEW_H = Math.round(PREVIEW_W * (3.5 / 2.5));
const PREVIEW_OFFSET_X = 18;

function ListView({
  cards,
  toolMode,
  selectedIds,
  onSelect,
  onOpenOverview,
}: {
  cards: PlacedCardState[];
  sortMode: CanvasSortMode;
  toolMode: ToolMode;
  selectedIds: ReadonlySet<string>;
  onSelect: (id: string, multi: boolean) => void;
  onOpenOverview: (placed: PlacedCardState) => void;
}) {
  const { setDraggingCard } = usePrerelease();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Pan support (transform-based, works regardless of overflow) ──
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const panOffset = useRef({ x: 155, y: -7 });
  const innerRef = useRef<HTMLDivElement>(null);
  const toolModeRef = useRef(toolMode);
  useEffect(() => {
    toolModeRef.current = toolMode;
  }, [toolMode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Apply default pan offset on mount
    if (innerRef.current) {
      const { x, y } = panOffset.current;
      innerRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }

    const onDown = (e: PointerEvent) => {
      if (toolModeRef.current !== "hand") return;
      e.preventDefault();
      isPanning.current = true;
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: panOffset.current.x,
        oy: panOffset.current.y,
      };
      el.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!isPanning.current) return;
      const nx = panStart.current.ox + (e.clientX - panStart.current.x);
      const ny = panStart.current.oy + (e.clientY - panStart.current.y);
      panOffset.current = { x: nx, y: ny };
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
    };

    const onUp = () => {
      isPanning.current = false;
      console.log("[ListView pan]", panOffset.current);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // ── Hover preview ──
  const [preview, setPreview] = useState<{
    placed: PlacedCardState;
    cx: number; // cursor clientX
    cy: number; // cursor clientY
  } | null>(null);
  const hidePreview = useCallback(() => setPreview(null), []);

  // Compute fixed position so preview stays inside viewport
  const previewStyle = useMemo((): React.CSSProperties => {
    if (!preview) return { display: "none" };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = preview.cx + PREVIEW_OFFSET_X;
    let top = preview.cy - PREVIEW_H / 2;
    if (left + PREVIEW_W > vw - 8)
      left = preview.cx - PREVIEW_W - PREVIEW_OFFSET_X;
    if (top < 8) top = 8;
    if (top + PREVIEW_H > vh - 8) top = vh - PREVIEW_H - 8;
    return { left, top, display: "block" };
  }, [preview]);

  const rareShowcaseCards = cards.filter(
    (placed) =>
      placed.card.rarity === "MYTHIC" || placed.card.rarity === "RARE",
  );
  const mainListCards = cards.filter(
    (placed) =>
      placed.card.rarity !== "MYTHIC" && placed.card.rarity !== "RARE",
  );

  const sortByCurve = (a: PlacedCardState, b: PlacedCardState) =>
    a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name);

  const rareSections = [
    {
      key: "MYTHIC",
      label: "Miticas",
      accent: "#f97316",
      items: rareShowcaseCards
        .filter((placed) => placed.card.rarity === "MYTHIC")
        .sort(sortByCurve),
    },
    {
      key: "RARE",
      label: "Raras",
      accent: "#f0d24b",
      items: rareShowcaseCards
        .filter((placed) => placed.card.rarity === "RARE")
        .sort(sortByCurve),
    },
  ].filter((section) => section.items.length > 0);

  // Group by color, sorted by CMC within each group
  const groupMap = new Map<string, PlacedCardState[]>();
  for (const placed of mainListCards) {
    const key = listColorKey(placed);
    const arr = groupMap.get(key) ?? [];
    arr.push(placed);
    groupMap.set(key, arr);
  }
  for (const arr of groupMap.values()) {
    arr.sort(sortByCurve);
  }
  const columns = LIST_COLOR_ORDER.flatMap((key) => {
    const items = groupMap.get(key);
    return items ? [{ key, items }] : [];
  });

  const renderColumn = ({
    key,
    label,
    accent,
    items,
  }: {
    key: string;
    label: string;
    accent: string;
    items: PlacedCardState[];
  }) => {
    const stackH =
      items.length <= 1 ? CARD_H : STACK_OFFSET * (items.length - 1) + CARD_H;

    return (
      <div
        key={key}
        className="flex shrink-0 flex-col gap-3"
        style={{ width: CARD_W }}
      >
        <div className="flex items-center gap-2">
          {key.length === 1 ? (
            <div className="h-4 w-4 shrink-0">
              <Image
                src={`/${key}.svg`}
                alt={label}
                width={16}
                height={16}
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ background: accent }}
            />
          )}
          <span
            className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: accent }}
          >
            {label}
          </span>
          <span
            className="ml-auto shrink-0 font-mono text-[13px] font-black tabular-nums leading-none"
            style={{ color: accent }}
          >
            {items.length}
          </span>
        </div>

        <div className="relative" style={{ height: stackH }}>
          {items.map((placed, i) => {
            const isLast = i === items.length - 1;
            const isCardSelected = selectedIds.has(placed.id);
            return (
              <button
                key={placed.id}
                type="button"
                draggable
                onClick={(e) => {
                  onSelect(placed.id, e.ctrlKey || e.metaKey || e.shiftKey);
                }}
                onDoubleClick={() => onOpenOverview(placed)}
                onMouseEnter={(e) =>
                  setPreview({ placed, cx: e.clientX, cy: e.clientY })
                }
                onMouseMove={(e) =>
                  setPreview((p) =>
                    p?.placed.id === placed.id
                      ? { placed, cx: e.clientX, cy: e.clientY }
                      : p,
                  )
                }
                onMouseLeave={hidePreview}
                onDragStart={(e) => {
                  hidePreview();
                  const ids =
                    isCardSelected && selectedIds.size > 1
                      ? Array.from(selectedIds)
                      : [placed.id];
                  e.dataTransfer.setData(
                    "application/x-placed-card-id",
                    ids[0],
                  );
                  e.dataTransfer.setData(
                    "application/x-placed-card-ids",
                    JSON.stringify(ids),
                  );
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingCard(placed.id);
                }}
                onDragEnd={() => setDraggingCard(null)}
                className="group absolute left-0 cursor-pointer p-0 transition-transform duration-150 hover:-translate-y-1.5"
                style={{
                  top: i * STACK_OFFSET,
                  zIndex: i + 1,
                  width: CARD_W,
                  height: isLast ? CARD_H : STACK_OFFSET,
                  overflow: isLast ? "visible" : "hidden",
                  pointerEvents: isHand ? "none" : undefined,
                }}
              >
                <div
                  className="relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                  style={{ width: CARD_W, height: CARD_H, borderRadius: 10 }}
                >
                  <Image
                    src={placed.card.imagePath}
                    alt={placed.card.name}
                    fill
                    sizes={`${CARD_W}px`}
                    className="object-cover"
                    draggable={false}
                  />
                  {placed.isFoil && (
                    <div className="absolute inset-0 foil-overlay pointer-events-none opacity-45" />
                  )}
                  {placed.isPromo && (
                    <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[9px] text-[#f59e0b]">
                      ★
                    </div>
                  )}
                  {!isLast && (
                    <div
                      className="absolute inset-x-0 bottom-0 h-[3px] opacity-80"
                      style={{
                        background:
                          RARITY_COLOR[placed.card.rarity] ?? "#64748b",
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-75"
                    style={{
                      borderRadius: 10,
                      boxShadow:
                        "0 0 0 2px #4d6393, 0 0 14px 2px rgba(77,99,147,0.45)",
                      opacity: isCardSelected ? 1 : 0,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (cards.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7f95c9]">
            Sem cartas
          </p>
          <p className="mt-2 text-sm text-white/35">
            Todas as cartas abertas já estão no main deck ou sideboard.
          </p>
        </div>
      </div>
    );
  }

  const isHand = toolMode === "hand";

  return (
    <>
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden"
        style={{ cursor: isHand ? "grab" : "default" }}
      >
        <div
          ref={innerRef}
          className="flex min-w-max flex-col items-start gap-8 px-8 py-8"
          style={{ willChange: "transform" }}
        >
          <div className="flex items-start gap-4">
            {columns.map(({ key, items }) =>
              renderColumn({
                key,
                items,
                label:
                  key === "Multi"
                    ? "Multi"
                    : key === "Incolor"
                      ? "Incolor"
                      : key === "Terra"
                        ? "Lands"
                        : (COLOR_LABEL[key] ?? key),
                accent: LIST_COLUMN_ACCENT[key] ?? "#7f95c9",
              }),
            )}
            {rareSections.map((section) => renderColumn(section))}
          </div>
        </div>
      </div>

      {/* Hover preview — rendered outside scroll container so it's not clipped */}
      <div
        className="pointer-events-none fixed z-[300000000] overflow-hidden rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.75)] transition-opacity duration-100"
        style={{
          ...previewStyle,
          width: PREVIEW_W,
          height: PREVIEW_H,
          opacity: preview ? 1 : 0,
        }}
      >
        {preview && (
          <Image
            src={preview.placed.card.imagePath}
            alt={preview.placed.card.name}
            fill
            sizes={`${PREVIEW_W}px`}
            className="object-cover"
            priority
          />
        )}
        {preview?.placed.isFoil && (
          <div className="absolute inset-0 foil-overlay pointer-events-none opacity-50" />
        )}
      </div>
    </>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const DndCard = memo(function DndCard({
  placed,
  priority,
  isSelected,
  selectedIds,
  scale,
  registry,
  onSelect,
  onOpenOverview,
  onGroupDragEnd,
}: DndCardProps) {
  const { setDraggingCard } = usePrerelease();
  const x = useMotionValue(placed.posX * scale);
  const y = useMotionValue(placed.posY * scale);
  const { isPending } = usePrerelease();
  const [localZ, setLocalZ] = useState(placed.zIndex);
  const cardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const isSelectedRef = useRef(isSelected);
  const selectedIdsRef = useRef(selectedIds);
  useEffect(() => {
    isSelectedRef.current = isSelected;
  }, [isSelected]);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    const reg = registry.current;
    reg.set(placed.id, { x, y });
    return () => {
      reg.delete(placed.id);
    };
  }, [placed.id, x, y, registry]);

  useEffect(() => {
    if (!isDragging.current && !isPending) {
      x.set(placed.posX * scale);
      y.set(placed.posY * scale);
      setLocalZ(placed.zIndex);
    }
  }, [placed.posX, placed.posY, placed.zIndex, x, y, isPending, scale]);

  // ── Mass-drag follower ──
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    function onStart(e: CustomEvent<MassDragStartPayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      startX = x.get();
      startY = y.get();
      setLocalZ(timeBasedZ() + 100_000);
      if (cardRef.current) {
        cardRef.current.style.opacity = "0.8";
        cardRef.current.style.filter = "brightness(1.15)";
      }
    }

    function onMove(e: CustomEvent<MassDragMovePayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      x.set(startX + e.detail.offsetX);
      y.set(startY + e.detail.offsetY);
    }

    function onEnd(e: CustomEvent<MassDragEndPayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      x.set(startX + e.detail.offsetX);
      y.set(startY + e.detail.offsetY);
      if (cardRef.current) {
        cardRef.current.style.opacity = "";
        cardRef.current.style.filter = "";
      }
    }

    function onCancel(e: CustomEvent<MassDragCancelPayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      x.set(startX);
      y.set(startY);
      if (cardRef.current) {
        cardRef.current.style.opacity = "";
        cardRef.current.style.filter = "";
      }
    }

    const handleStart = onStart as EventListener;
    const handleMove = onMove as EventListener;
    const handleEnd = onEnd as EventListener;
    const handleCancel = onCancel as EventListener;

    window.addEventListener("mass-drag-start", handleStart);
    window.addEventListener("mass-drag-move", handleMove);
    window.addEventListener("mass-drag-end", handleEnd);
    window.addEventListener("mass-drag-cancel", handleCancel);
    return () => {
      window.removeEventListener("mass-drag-start", handleStart);
      window.removeEventListener("mass-drag-move", handleMove);
      window.removeEventListener("mass-drag-end", handleEnd);
      window.removeEventListener("mass-drag-cancel", handleCancel);
    };
  }, [placed.id, x, y]);

  function handleDragStart() {
    isDragging.current = true;
    dragStartPos.current = { x: x.get(), y: y.get() };
    setLocalZ(timeBasedZ() + 100_000);
    setDraggingCard(placed.id);

    if (isSelectedRef.current && selectedIdsRef.current.size > 1) {
      window.dispatchEvent(
        new CustomEvent("mass-drag-start", { detail: { leaderId: placed.id } }),
      );
    }
  }

  function handleDrag(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const rawX = dragStartPos.current.x + info.offset.x;
    const rawY = dragStartPos.current.y + info.offset.y;

    x.set(rawX);
    y.set(rawY);

    if (!isSelectedRef.current || selectedIdsRef.current.size <= 1) return;

    window.dispatchEvent(
      new CustomEvent("mass-drag-move", {
        detail: {
          leaderId: placed.id,
          offsetX: info.offset.x,
          offsetY: info.offset.y,
        },
      }),
    );
  }

  function handleDragEnd(
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    isDragging.current = false;
    const isGroup = isSelectedRef.current && selectedIdsRef.current.size > 1;

    const clientX = "clientX" in e ? e.clientX : e.changedTouches[0].clientX;
    const clientY = "clientY" in e ? e.clientY : e.changedTouches[0].clientY;

    if (isGroup) {
      x.set(dragStartPos.current.x + info.offset.x);
      y.set(dragStartPos.current.y + info.offset.y);
      window.dispatchEvent(
        new CustomEvent("mass-drag-end", {
          detail: {
            leaderId: placed.id,
            offsetX: info.offset.x,
            offsetY: info.offset.y,
            snapGrid: null,
          },
        }),
      );
    } else {
      setLocalZ(timeBasedZ());
    }

    onGroupDragEnd(
      placed.id,
      { x: clientX, y: clientY },
      { x: dragStartPos.current.x / scale, y: dragStartPos.current.y / scale },
    );
  }

  return (
    <motion.div
      ref={cardRef}
      data-dnd-card={placed.id}
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{
        x,
        y,
        zIndex: localZ,
        width: CARD_W * scale,
        height: CARD_H * scale,
      }}
      className="absolute left-0 top-0 touch-none will-change-transform cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!isSelected || e.ctrlKey || e.metaKey || e.shiftKey) {
          onSelect(placed.id, e.ctrlKey || e.metaKey || e.shiftKey);
        }
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDoubleClick={() => onOpenOverview(placed)}
      whileDrag={{ scale: 1.05 }}
    >
      <CardFrame placed={placed} priority={priority} />
      <div
        className="absolute inset-0 rounded-[7px] pointer-events-none transition-opacity duration-75"
        style={{
          boxShadow: "0 0 0 2px #4d6393, 0 0 14px 2px rgba(77,99,147,0.45)",
          opacity: isSelected ? 1 : 0,
        }}
      />
      {placed.isPromo && <StarBadge />}
      {placed.card.set === "SOA" && <ArchiveBadge />}
    </motion.div>
  );
});

// ─── Card visuals ─────────────────────────────────────────────────────────────

function CardFrame({
  placed,
  priority,
}: {
  placed: PlacedCardState;
  priority: boolean;
}) {
  const isSoa = placed.card.set === "SOA";
  return (
    <div
      className={`relative w-full h-full rounded-[7px] overflow-hidden bg-bg-void border border-white/5 shadow-2xl
        ${isSoa ? "outline outline-1 outline-gold-accent/70 shadow-[0_0_15px_rgba(77,99,147,0.3)]" : ""}
        ${placed.isPromo ? "shadow-[0_0_20px_rgba(77,99,147,0.5)]" : ""}
      `}
    >
      {placed.card.imagePath ? (
        <Image
          src={placed.card.imagePath}
          alt={placed.card.name}
          fill
          priority={priority}
          sizes="130px"
          className="object-cover pointer-events-none select-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-silverquill-ink flex flex-col items-center justify-center p-2 text-center text-gold-accent text-[9px] font-semibold">
          <RarityPip rarity={placed.card.rarity} size="lg" />
          <span className="mt-1 line-clamp-2">{placed.card.name}</span>
        </div>
      )}
      {placed.isFoil && (
        <div className="absolute inset-0 foil-overlay pointer-events-none opacity-50" />
      )}
      {placed.isPromo && <div className="promo-gloss-beam" />}
      <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 pointer-events-none">
        <RarityPip rarity={placed.card.rarity} />
      </div>
    </div>
  );
}

function CardOverview({
  placed,
  onClose,
}: {
  placed: PlacedCardState;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200000000] flex items-center justify-center bg-bg-void/90 backdrop-blur-md p-4 cursor-zoom-out"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(95vw,500px)] aspect-[2.5/3.5] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <Image
          src={placed.card.imagePath}
          alt={placed.card.name}
          fill
          quality={100}
          sizes="600px"
          className="object-contain"
          priority
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center text-2xl hover:bg-black/80 transition-colors shadow-lg"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Micro components ─────────────────────────────────────────────────────────

function StarBadge() {
  return (
    <div className="absolute -top-2 -right-2 z-10 text-gold-accent drop-shadow-md pointer-events-none">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  );
}

function ArchiveBadge() {
  return (
    <div className="absolute -top-2 -left-2 z-10 pointer-events-none">
      <span className="text-[8px] font-bold text-gold-accent bg-bg-void/90 px-1.5 py-0.5 rounded border border-gold-accent/50 shadow-md">
        A
      </span>
    </div>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
    >
      <line x1="7" y1="5" x2="17" y2="5" />
      <line x1="7" y1="10" x2="17" y2="10" />
      <line x1="7" y1="15" x2="17" y2="15" />
      <circle cx="3.5" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CursorIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M4 2.5l11 7.5-5.2 1.2-2.8 5.3-3-14z" />
    </svg>
  );
}

function CanvasIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
    >
      <rect x="3" y="3" width="14" height="14" rx="2.2" />
      <path d="M3 8.5h14" />
      <path d="M8.5 3v14" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <rect x="3" y="3" width="5" height="5" rx="1.2" />
      <rect x="12" y="3" width="5" height="5" rx="1.2" />
      <rect x="3" y="12" width="5" height="5" rx="1.2" />
      <rect x="12" y="12" width="5" height="5" rx="1.2" />
    </svg>
  );
}

function RarityPip({
  rarity,
  size = "sm",
}: {
  rarity: string;
  size?: "sm" | "lg";
}) {
  const colors: Record<string, string> = {
    COMMON: "bg-white/40",
    UNCOMMON: "bg-slate-400",
    RARE: "bg-yellow-400",
    MYTHIC: "bg-orange-500",
  };
  const dim = size === "lg" ? "w-3 h-3" : "w-1.5 h-1.5";
  return (
    <span
      className={`block rounded-full shadow-md ${dim} ${colors[rarity] ?? "bg-white/20"}`}
    />
  );
}
