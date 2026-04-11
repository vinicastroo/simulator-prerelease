"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  AnimatePresence,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import Image from "next/image";
import { usePrerelease, type PlacedCardState } from "@/context/PrereleaseContext";

// ─── Constants ────────────────────────────────────────────────────────────────

export const WORLD_W = 3000;
export const WORLD_H = 3000;
export const CARD_W = 130;
export const CARD_H = 182;
const GRID_SIZE = 32;

const EPOCH_2024_S = 1_704_067_200;
function timeBasedZ(): number {
  return Math.floor(Date.now() / 1000) - EPOCH_2024_S;
}

function snapToGrid(value: number, grid: number): number {
  return Math.round(value / grid) * grid;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── CustomEvent types ────────────────────────────────────────────────────────

interface MassDragStartPayload { leaderId: string }
interface MassDragMovePayload  { leaderId: string; offsetX: number; offsetY: number }
interface MassDragEndPayload   { leaderId: string; offsetX: number; offsetY: number; snapGrid: number | null }
interface MassDragCancelPayload { leaderId: string }

declare global {
  interface WindowEventMap {
    "mass-drag-start":  CustomEvent<MassDragStartPayload>;
    "mass-drag-move":   CustomEvent<MassDragMovePayload>;
    "mass-drag-end":    CustomEvent<MassDragEndPayload>;
    "mass-drag-cancel": CustomEvent<MassDragCancelPayload>;
  }
}

// ─── Card registry ────────────────────────────────────────────────────────────

type CardEntry    = { x: MotionValue<number>; y: MotionValue<number> };
type CardRegistry = Map<string, CardEntry>;

// ─── Lasso helpers ────────────────────────────────────────────────────────────

interface LassoRect { x: number; y: number; w: number; h: number }

function rectsIntersect(lasso: LassoRect, card: PlacedCardState): boolean {
  return !(
    lasso.x + lasso.w < card.posX ||
    lasso.x           > card.posX + CARD_W ||
    lasso.y + lasso.h < card.posY ||
    lasso.y           > card.posY + CARD_H
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolMode = "select" | "hand";

interface ZoomProps {
  scale: number;
  setScale: (s: number) => void;
  snapEnabled: boolean;
  setSnapEnabled: (s: boolean) => void;
  toolMode: ToolMode;
  setToolMode: (m: ToolMode) => void;
}

interface DndCardProps {
  placed: PlacedCardState;
  priority: boolean;
  isSelected: boolean;
  selectedIds: ReadonlySet<string>;
  snapEnabled: boolean;
  registry: React.MutableRefObject<CardRegistry>;
  onSelect: (id: string, multi: boolean) => void;
  onOpenOverview: (placed: PlacedCardState) => void;
  onGroupDragEnd: (
    leaderId: string,
    clientPos: { x: number; y: number },
    startPos: { x: number; y: number }
  ) => void;
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ZoomControls({
  scale, setScale, snapEnabled, setSnapEnabled, toolMode, setToolMode,
}: ZoomProps) {
  return (
    <div className="fixed bottom-6 right-80 z-[150000000] flex flex-col gap-2 bg-bg-void/80 p-2 rounded-xl border border-gold-accent/20 backdrop-blur-md shadow-2xl">
      <button
        onClick={() => setScale(Math.min(scale + 0.2, 2.5))}
        className="w-10 h-10 flex items-center justify-center text-gold-accent hover:bg-gold-accent/10 rounded-lg transition-colors font-bold text-xl"
      >
        +
      </button>
      <div className="h-[1px] bg-gold-accent/20 mx-2" />
      <button
        onClick={() => setScale(Math.max(scale - 0.2, 0.4))}
        className="w-10 h-10 flex items-center justify-center text-gold-accent hover:bg-gold-accent/10 rounded-lg transition-colors font-bold text-xl"
      >
        −
      </button>
      <div className="text-[10px] text-gold-accent/60 text-center mt-1 font-mono">
        {Math.round(scale * 100)}%
      </div>
      <div className="h-[1px] bg-gold-accent/20 mx-2" />
      <button
        title="Mover canvas (H)"
        onClick={() => setToolMode(toolMode === "hand" ? "select" : "hand")}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-base ${
          toolMode === "hand"
            ? "bg-gold-accent/20 text-gold-accent"
            : "text-gold-accent/40 hover:bg-gold-accent/10"
        }`}
      >
        ✋
      </button>
      <div className="h-[1px] bg-gold-accent/20 mx-2" />
      <button
        title={snapEnabled ? "Snap: ligado" : "Snap: desligado"}
        onClick={() => setSnapEnabled(!snapEnabled)}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-xs font-bold ${
          snapEnabled
            ? "bg-gold-accent/20 text-gold-accent"
            : "text-gold-accent/40 hover:bg-gold-accent/10"
        }`}
      >
        ⊞
      </button>
    </div>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export function DndCanvas() {
  const { cards, moveCards } = usePrerelease();
  const { setDeckZone, setDraggingCard } = usePrerelease();

  const [scale, setScale]             = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [toolMode, setToolMode]       = useState<ToolMode>("select");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [viewingCard, setViewingCard] = useState<PlacedCardState | null>(null);

  // Pan offset (MotionValues → no re-renders while panning)
  const worldX = useMotionValue(0);
  const worldY = useMotionValue(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef    = useRef<HTMLDivElement>(null);
  const registry    = useRef<CardRegistry>(new Map());

  // Stable refs for callbacks
  const scaleRef       = useRef(scale);
  const snapRef        = useRef(snapEnabled);
  const selectedIdsRef = useRef(selectedIds);
  const toolModeRef    = useRef(toolMode);
  const spaceHeld      = useRef(false);
  useEffect(() => { scaleRef.current       = scale;       }, [scale]);
  useEffect(() => { snapRef.current        = snapEnabled; }, [snapEnabled]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => { toolModeRef.current    = toolMode;    }, [toolMode]);

  // Lasso state — all in refs, zero re-renders during mouse move
  const lassoActive = useRef(false);
  const lassoStart  = useRef({ x: 0, y: 0 });
  const lassoEl     = useRef<HTMLDivElement>(null);
  const rAFId       = useRef(0);

  // Pan state
  const isPanning   = useRef(false);
  const panStart    = useRef({ clientX: 0, clientY: 0, wx: 0, wy: 0 });

  // ── Keyboard: Space = temporary hand tool ──
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) { e.preventDefault(); spaceHeld.current = true; }
      if (e.code === "KeyH") setToolMode((m) => m === "hand" ? "select" : "hand");
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceHeld.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // ── Wheel: Ctrl/Cmd = zoom-to-cursor, else = pan ──
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && worldRef.current) {
        const vpRect    = vp.getBoundingClientRect();
        const worldRect = worldRef.current.getBoundingClientRect();
        const currentScale = worldRect.width / WORLD_W;
        const newScale     = clamp(currentScale - e.deltaY * 0.0015, 0.4, 2.5);

        // Zoom towards cursor: keep the world point under cursor fixed
        const cursorVpX   = e.clientX - vpRect.left;
        const cursorVpY   = e.clientY - vpRect.top;
        const originX     = worldRect.left - vpRect.left; // = worldX.get()
        const originY     = worldRect.top  - vpRect.top;
        const wPointX     = (cursorVpX - originX) / currentScale;
        const wPointY     = (cursorVpY - originY) / currentScale;
        worldX.set(cursorVpX - wPointX * newScale);
        worldY.set(cursorVpY - wPointY * newScale);
        setScale(newScale);
      } else {
        // Two-finger scroll / trackpad → pan
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
      y: (clientY - rect.top)  / actualScale,
    };
  }, []);

  // ── Background pointer handlers (pan or lasso) ──
  const onWorldPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const isHandMode = toolModeRef.current === "hand" || spaceHeld.current;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (isHandMode) {
      isPanning.current = true;
      panStart.current  = { clientX: e.clientX, clientY: e.clientY, wx: worldX.get(), wy: worldY.get() };
      return;
    }

    // Lasso
    const pos = toWorld(e.clientX, e.clientY);
    lassoActive.current = true;
    lassoStart.current  = pos;
    if (lassoEl.current) {
      lassoEl.current.style.cssText =
        `display:block;left:${pos.x}px;top:${pos.y}px;width:0;height:0`;
    }
  }, [toWorld, worldX, worldY]);

  const onWorldPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      worldX.set(panStart.current.wx + (e.clientX - panStart.current.clientX));
      worldY.set(panStart.current.wy + (e.clientY - panStart.current.clientY));
      return;
    }
    if (!lassoActive.current) return;

    cancelAnimationFrame(rAFId.current);
    const cx = e.clientX, cy = e.clientY;
    rAFId.current = requestAnimationFrame(() => {
      const curr = toWorld(cx, cy);
      const x = Math.min(curr.x, lassoStart.current.x);
      const y = Math.min(curr.y, lassoStart.current.y);
      const w = Math.abs(curr.x - lassoStart.current.x);
      const h = Math.abs(curr.y - lassoStart.current.y);
      if (lassoEl.current) {
        lassoEl.current.style.cssText =
          `display:block;left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      }
    });
  }, [toWorld, worldX, worldY]);

  const onWorldPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }
    if (!lassoActive.current) return;

    cancelAnimationFrame(rAFId.current);
    lassoActive.current = false;
    if (lassoEl.current) lassoEl.current.style.display = "none";

    const curr  = toWorld(e.clientX, e.clientY);
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
      new Set(cards.filter((c) => rectsIntersect(lasso, c)).map((c) => c.id))
    );
  }, [cards, toWorld]);

  // ── Card selection ──
  const handleCardSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds((prev) => {
      if (multi) {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); } else { next.add(id); }
        return next;
      }
      return new Set([id]);
    });
  }, []);

  const handleOpenOverview = useCallback((placed: PlacedCardState) => {
    setViewingCard(placed);
  }, []);

  // ── Group drag end ──
  const handleGroupDragEnd = useCallback(
    (
      leaderId: string,
      clientPos: { x: number; y: number },
      startPos:  { x: number; y: number }
    ) => {
      setDraggingCard(null);

      // Check if dropped over a deck zone in the Sidebar
      const dropEl  = document.elementFromPoint(clientPos.x, clientPos.y);
      const zoneEl  = dropEl?.closest("[data-zone]") as HTMLElement | null;

      if (zoneEl) {
        const zone     = zoneEl.dataset.zone === "main" ? true : false;
        const sel      = selectedIdsRef.current;
        const isGroup  = sel.has(leaderId) && sel.size > 1;
        const ids      = isGroup ? Array.from(sel) : [leaderId];

        // Restore leader position (card stays on canvas)
        const entry = registry.current.get(leaderId);
        if (entry) {
          entry.x.set(startPos.x);
          entry.y.set(startPos.y);
        }
        // Followers restore via cancel event (synchronous)
        if (isGroup) {
          window.dispatchEvent(
            new CustomEvent("mass-drag-cancel", { detail: { leaderId } })
          );
        }

        setDeckZone(ids, zone);
        return;
      }

      // Normal path: persist canvas positions
      const sel    = selectedIdsRef.current;
      const isGroup = sel.has(leaderId) && sel.size > 1;
      const ids    = isGroup ? Array.from(sel) : [leaderId];
      const snap   = snapRef.current;

      const updates = ids
        .filter((id) => registry.current.has(id))
        .map((id) => {
          const e    = registry.current.get(id)!;
          const rawX = clamp(e.x.get(), 0, WORLD_W - CARD_W);
          const rawY = clamp(e.y.get(), 0, WORLD_H - CARD_H);
          return {
            id,
            posX:   snap ? snapToGrid(rawX, GRID_SIZE) : rawX,
            posY:   snap ? snapToGrid(rawY, GRID_SIZE) : rawY,
            zIndex: timeBasedZ(),
          };
        });

      if (updates.length > 0) moveCards(updates);
    },
    [moveCards, setDeckZone, setDraggingCard] // selectedIdsRef + snapRef via ref
  );

  const cursorClass =
    toolMode === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default";

  return (
    <div
      ref={viewportRef}
      className={`h-full w-full overflow-hidden bg-bg-void outline-none relative ${cursorClass}`}
      tabIndex={0}
    >
      <motion.div
        ref={worldRef}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ x: worldX, y: worldY, width: WORLD_W, height: WORLD_H, transformOrigin: "0 0" }}
        className="relative select-none"
        onPointerDown={onWorldPointerDown}
        onPointerMove={onWorldPointerMove}
        onPointerUp={onWorldPointerUp}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(197,160,89,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Lasso rect */}
        <div
          ref={lassoEl}
          className="absolute pointer-events-none rounded-sm"
          style={{
            display:    "none",
            border:     "1px solid rgba(197,160,89,0.8)",
            background: "rgba(197,160,89,0.07)",
          }}
        />

        {cards.map((placed, i) => (
          <DndCard
            key={placed.id}
            placed={placed}
            priority={i < 20}
            isSelected={selectedIds.has(placed.id)}
            selectedIds={selectedIds}
            snapEnabled={snapEnabled}
            registry={registry}
            onSelect={handleCardSelect}
            onOpenOverview={handleOpenOverview}
            onGroupDragEnd={handleGroupDragEnd}
          />
        ))}
      </motion.div>

      <ZoomControls
        scale={scale}
        setScale={setScale}
        snapEnabled={snapEnabled}
        setSnapEnabled={setSnapEnabled}
        toolMode={toolMode}
        setToolMode={setToolMode}
      />

      <AnimatePresence>
        {viewingCard && (
          <CardOverview placed={viewingCard} onClose={() => setViewingCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Draggable Card ───────────────────────────────────────────────────────────

const DndCard = memo(function DndCard({
  placed, priority, isSelected, selectedIds, snapEnabled,
  registry, onSelect, onOpenOverview, onGroupDragEnd,
}: DndCardProps) {
  const { isPending, setDraggingCard } = usePrerelease();
  const x = useMotionValue(placed.posX);
  const y = useMotionValue(placed.posY);
  const [localZ, setLocalZ] = useState(placed.zIndex);

  const cardRef       = useRef<HTMLDivElement>(null);
  const isDragging    = useRef(false);
  const dragStartPos  = useRef({ x: 0, y: 0 });

  const isSelectedRef  = useRef(isSelected);
  const selectedIdsRef = useRef(selectedIds);
  const snapRef        = useRef(snapEnabled);
  useEffect(() => { isSelectedRef.current  = isSelected;  }, [isSelected]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => { snapRef.current        = snapEnabled; }, [snapEnabled]);

  // Register in canvas registry
  useEffect(() => {
    const reg = registry.current;
    reg.set(placed.id, { x, y });
    return () => { reg.delete(placed.id); };
  }, [placed.id, x, y, registry]);

  // Sync server state when idle
  useEffect(() => {
    if (!isDragging.current && !isPending) {
      x.set(placed.posX);
      y.set(placed.posY);
      setLocalZ(placed.zIndex);
    }
  }, [placed.posX, placed.posY, placed.zIndex, x, y, isPending]);

  // ── Mass-drag follower ──
  useEffect(() => {
    let startX = 0, startY = 0;

    function onStart(e: CustomEvent<MassDragStartPayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      startX = x.get();
      startY = y.get();
      setLocalZ(timeBasedZ() + 100_000);
      if (cardRef.current) {
        cardRef.current.style.opacity = "0.8";
        cardRef.current.style.filter  = "brightness(1.15)";
      }
    }

    function onMove(e: CustomEvent<MassDragMovePayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      x.set(startX + e.detail.offsetX);
      y.set(startY + e.detail.offsetY);
    }

    function onEnd(e: CustomEvent<MassDragEndPayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      const rawX = startX + e.detail.offsetX;
      const rawY = startY + e.detail.offsetY;
      const { snapGrid } = e.detail;
      x.set(clamp(snapGrid ? snapToGrid(rawX, snapGrid) : rawX, 0, WORLD_W - CARD_W));
      y.set(clamp(snapGrid ? snapToGrid(rawY, snapGrid) : rawY, 0, WORLD_H - CARD_H));
      if (cardRef.current) {
        cardRef.current.style.opacity = "";
        cardRef.current.style.filter  = "";
      }
    }

    function onCancel(e: CustomEvent<MassDragCancelPayload>) {
      if (e.detail.leaderId === placed.id || !isSelectedRef.current) return;
      // Restore to position captured at drag-start
      x.set(startX);
      y.set(startY);
      if (cardRef.current) {
        cardRef.current.style.opacity = "";
        cardRef.current.style.filter  = "";
      }
    }

    window.addEventListener("mass-drag-start",  onStart);
    window.addEventListener("mass-drag-move",   onMove);
    window.addEventListener("mass-drag-end",    onEnd);
    window.addEventListener("mass-drag-cancel", onCancel);
    return () => {
      window.removeEventListener("mass-drag-start",  onStart);
      window.removeEventListener("mass-drag-move",   onMove);
      window.removeEventListener("mass-drag-end",    onEnd);
      window.removeEventListener("mass-drag-cancel", onCancel);
    };
  }, [placed.id, x, y]);

  // ── Drag handlers ──

  function handleDragStart() {
    isDragging.current   = true;
    dragStartPos.current = { x: x.get(), y: y.get() };
    setLocalZ(timeBasedZ() + 100_000);
    setDraggingCard(placed.id);

    if (isSelectedRef.current && selectedIdsRef.current.size > 1) {
      window.dispatchEvent(
        new CustomEvent("mass-drag-start", { detail: { leaderId: placed.id } })
      );
    }
  }

  function handleDrag(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (!isSelectedRef.current || selectedIdsRef.current.size <= 1) return;
    window.dispatchEvent(
      new CustomEvent("mass-drag-move", {
        detail: { leaderId: placed.id, offsetX: info.offset.x, offsetY: info.offset.y },
      })
    );
  }

  function handleDragEnd(e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    isDragging.current  = false;
    const isGroup       = isSelectedRef.current && selectedIdsRef.current.size > 1;
    const snapGrid      = snapRef.current ? GRID_SIZE : null;

    // Final client position for zone detection
    const clientX = "clientX" in e ? e.clientX : (e as TouchEvent).changedTouches[0].clientX;
    const clientY = "clientY" in e ? e.clientY : (e as TouchEvent).changedTouches[0].clientY;

    if (isGroup) {
      const rawX = dragStartPos.current.x + info.offset.x;
      const rawY = dragStartPos.current.y + info.offset.y;
      x.set(clamp(snapGrid ? snapToGrid(rawX, snapGrid) : rawX, 0, WORLD_W - CARD_W));
      y.set(clamp(snapGrid ? snapToGrid(rawY, snapGrid) : rawY, 0, WORLD_H - CARD_H));
      window.dispatchEvent(
        new CustomEvent("mass-drag-end", {
          detail: { leaderId: placed.id, offsetX: info.offset.x, offsetY: info.offset.y, snapGrid },
        })
      );
    } else {
      const rawX = x.get();
      const rawY = y.get();
      x.set(clamp(snapGrid ? snapToGrid(rawX, snapGrid) : rawX, 0, WORLD_W - CARD_W));
      y.set(clamp(snapGrid ? snapToGrid(rawY, snapGrid) : rawY, 0, WORLD_H - CARD_H));
      setLocalZ(timeBasedZ());
    }

    onGroupDragEnd(
      placed.id,
      { x: clientX, y: clientY },
      dragStartPos.current
    );
  }

  return (
    <motion.div
      ref={cardRef}
      data-dnd-card={placed.id}
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{ x, y, zIndex: localZ, width: CARD_W, height: CARD_H }}
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
          boxShadow: "0 0 0 2px #C5A059, 0 0 14px 2px rgba(197,160,89,0.45)",
          opacity: isSelected ? 1 : 0,
        }}
      />
      {placed.isPromo && <StarBadge />}
      {placed.card.set === "SOA" && <ArchiveBadge />}
    </motion.div>
  );
});

// ─── Card visuals ─────────────────────────────────────────────────────────────

function CardFrame({ placed, priority }: { placed: PlacedCardState; priority: boolean }) {
  const isSoa = placed.card.set === "SOA";
  return (
    <div
      className={`relative w-full h-full rounded-[7px] overflow-hidden bg-bg-void border border-white/5 shadow-2xl
        ${isSoa         ? "outline outline-1 outline-gold-accent/70 shadow-[0_0_15px_rgba(197,160,89,0.3)]" : ""}
        ${placed.isPromo ? "shadow-[0_0_20px_rgba(197,160,89,0.5)]" : ""}
      `}
    >
      {placed.card.imagePath ? (
        <Image
          src={placed.card.imagePath}
          alt={placed.card.name}
          fill priority={priority}
          sizes="512px" quality={100}
          className="object-cover pointer-events-none"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
        />
      ) : (
        <div className="w-full h-full bg-silverquill-ink flex flex-col items-center justify-center p-2 text-center text-gold-accent text-[9px] font-semibold">
          <RarityPip rarity={placed.card.rarity} size="lg" />
          <span className="mt-1 line-clamp-2">{placed.card.name}</span>
        </div>
      )}
      {placed.isFoil  && <div className="absolute inset-0 foil-overlay pointer-events-none opacity-50" />}
      {placed.isPromo && <div className="promo-gloss-beam" />}
      <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 pointer-events-none">
        <RarityPip rarity={placed.card.rarity} />
      </div>
    </div>
  );
}

function CardOverview({ placed, onClose }: { placed: PlacedCardState; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200000000] flex items-center justify-center bg-bg-void/90 backdrop-blur-md p-4 cursor-zoom-out"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(95vw,500px)] aspect-[2.5/3.5] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <Image src={placed.card.imagePath} alt={placed.card.name}
          fill quality={100} sizes="600px" className="object-contain" priority />
        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center text-2xl hover:bg-black/80 transition-colors shadow-lg">
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
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
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

function RarityPip({ rarity, size = "sm" }: { rarity: string; size?: "sm" | "lg" }) {
  const colors: Record<string, string> = {
    COMMON:   "bg-white/40",
    UNCOMMON: "bg-slate-400",
    RARE:     "bg-yellow-400",
    MYTHIC:   "bg-orange-500",
  };
  const dim = size === "lg" ? "w-3 h-3" : "w-1.5 h-1.5";
  return <span className={`block rounded-full shadow-md ${dim} ${colors[rarity] ?? "bg-white/20"}`} />;
}
