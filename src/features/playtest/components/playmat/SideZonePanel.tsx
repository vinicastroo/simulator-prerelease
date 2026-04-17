"use client";

import { useDndMonitor, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import type { ReactNode } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  selectCardWithDefinition,
  selectTopLibraryCards,
} from "@/lib/game/selectors";
import { shuffleCardIds } from "@/lib/game/shuffle";
import type { CardInstance } from "@/lib/game/types";
import { useGameStore } from "../../store/useGameStore";
import { DeckTopCard } from "./DeckTopCard";
import { ModalDropZoneOverlay } from "./ModalDropZones";
import { PreviewOverlay } from "./PreviewOverlay";
import { StackTopCard } from "./StackTopCard";
import type { CardHoverInfo, DragCardData, PreviewAnchor } from "./types";

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

type SideZoneShellProps = {
  label: string;
  count: number;
  isOver: boolean;
  isAnyDragActive: boolean;
  setRef?: (node: HTMLDivElement | null) => void;
  onView?: () => void;
  children: ReactNode;
};

const SideZoneShell = memo(function SideZoneShell({
  label,
  count,
  isOver,
  isAnyDragActive,
  setRef,
  onView,
  children,
}: SideZoneShellProps) {
  return (
    <div
      ref={setRef}
      className={`flex flex-col items-start gap-1.5 font-mono rounded-[10px] ${
        isAnyDragActive
          ? isOver
            ? "ring-2 ring-white/80 bg-white/10"
            : "ring-1 ring-white/35 bg-white/[0.05]"
          : ""
      }`}
    >
      <div className="flex justify-between items-center w-full">
        {onView ? (
          <button
            type="button"
            onClick={onView}
            className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            {label}
          </button>
        ) : (
          <span className="text-center text-xs">{label}</span>
        )}
        <p className="text-[10px] text-white/40">{count}</p>
      </div>
      {children}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Card frame
// ---------------------------------------------------------------------------

type SideZoneCardFrameProps = {
  children: ReactNode;
};

function _SideZoneCardFrame({ children }: SideZoneCardFrameProps) {
  return (
    <div className="relative flex min-h-[190px] min-w-[140px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stack zones (graveyard / exile)
// ---------------------------------------------------------------------------

type StackZoneProps = {
  zone: "graveyard" | "exile";
  label: string;
  top: CardInstance | undefined;
  topName: string;
  topImageUrl: string | null;
  count: number;
  isOver: boolean;
  isAnyDragActive: boolean;
  setRef: (node: HTMLDivElement | null) => void;
  onView: () => void;
  onHoverTop: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
};

const StackZone = memo(function StackZone({
  zone,
  label,
  top,
  topName,
  topImageUrl,
  count,
  isOver,
  isAnyDragActive,
  setRef,
  onView,
  onHoverTop,
}: StackZoneProps) {
  return (
    <SideZoneShell
      label={label}
      count={count}
      isOver={isOver}
      isAnyDragActive={isAnyDragActive}
      setRef={setRef}
      onView={onView}
    >
      <button
        type="button"
        className="relative h-[140px] w-[100px] cursor-pointer overflow-hidden rounded-[8px] border border-white/20 bg-white/[0.02] transition hover:border-white/40"
        onClick={onView}
      >
        {top ? (
          <StackTopCard
            cardId={top.id}
            zone={zone}
            name={topName}
            imageUrl={topImageUrl}
            onHover={onHoverTop}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40">
            vazio
          </span>
        )}
      </button>
    </SideZoneShell>
  );
});

// ---------------------------------------------------------------------------
// Library zone with context menu
// ---------------------------------------------------------------------------

type ScryCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  dest: "top" | "bottom";
};

type SurveilCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  dest: "top" | "graveyard";
};

type LibraryViewCard = {
  id: string;
  name: string;
  imageUrl: string | null;
};

const ScryCardItem = memo(function ScryCardItem({
  card,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}: {
  card: ScryCard;
  onToggle: (id: string) => void;
  onMouseEnter: (card: ScryCard, target: HTMLElement) => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      key={card.id}
      type="button"
      onClick={() => onToggle(card.id)}
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      onMouseEnter={(event) => onMouseEnter(card, event.currentTarget)}
      onMouseLeave={onMouseLeave}
    >
      {card.imageUrl ? (
        <Image
          src={card.imageUrl}
          alt={card.name}
          width={100}
          height={139}
          className={`rounded-[6px] border-2 transition-all ${
            card.dest === "top"
              ? "border-white/50"
              : "border-red-500/60 opacity-50"
          }`}
          unoptimized
        />
      ) : (
        <div
          className={`flex h-[139px] w-[100px] items-center justify-center rounded-[6px] border-2 p-1 text-center text-[10px] ${
            card.dest === "top"
              ? "border-white/50 bg-white/5"
              : "border-red-500/60 bg-red-500/5 opacity-50"
          }`}
        >
          {card.name}
        </div>
      )}
      <span
        className={`rounded px-2 py-0.5 font-mono text-[10px] ${
          card.dest === "top"
            ? "bg-white/10 text-white"
            : "bg-red-500/20 text-red-300"
        }`}
      >
        {card.dest === "top" ? "Topo" : "Fundo"}
      </span>
    </button>
  );
});

const SurveilCardItem = memo(function SurveilCardItem({
  card,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}: {
  card: SurveilCard;
  onToggle: (id: string) => void;
  onMouseEnter: (card: SurveilCard, target: HTMLElement) => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      key={card.id}
      type="button"
      onClick={() => onToggle(card.id)}
      className="flex cursor-pointer flex-col items-center gap-1.5"
      onMouseEnter={(event) => onMouseEnter(card, event.currentTarget)}
      onMouseLeave={onMouseLeave}
    >
      {card.imageUrl ? (
        <Image
          src={card.imageUrl}
          alt={card.name}
          width={100}
          height={139}
          className={`rounded-[6px] border-2 transition-all ${
            card.dest === "top"
              ? "border-white/50"
              : "border-emerald-500/60 opacity-50"
          }`}
          unoptimized
        />
      ) : (
        <div
          className={`flex h-[139px] w-[100px] items-center justify-center rounded-[6px] border-2 p-1 text-center text-[10px] ${
            card.dest === "top"
              ? "border-white/50 bg-white/5"
              : "border-emerald-500/60 bg-emerald-500/5 opacity-50"
          }`}
        >
          {card.name}
        </div>
      )}
      <span
        className={`rounded px-2 py-0.5 font-mono text-[10px] ${
          card.dest === "top"
            ? "bg-white/10 text-white"
            : "bg-emerald-500/20 text-emerald-300"
        }`}
      >
        {card.dest === "top" ? "Topo" : "Cemitério"}
      </span>
    </button>
  );
});

const LibraryViewCardButton = memo(function LibraryViewCardButton({
  card,
  onHover,
}: {
  card: LibraryViewCard;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `library-view-${card.id}`,
      data: {
        cardId: card.id,
        from: "library",
        behavior: "move-from-library",
      } satisfies DragCardData,
    });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="flex flex-col items-center gap-1.5 rounded-lg bg-transparent p-0 text-inherit"
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      onMouseEnter={(event) =>
        onHover(
          { name: card.name, imageUrl: card.imageUrl },
          event.currentTarget,
        )
      }
      onMouseLeave={() => onHover(null, null)}
      {...listeners}
      {...attributes}
    >
      <div className="relative h-[167px] w-[120px] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.03] shadow-lg">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={120}
            height={167}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] text-white/55">
            {card.name}
          </div>
        )}
      </div>
      <span className="max-w-[120px] truncate text-center text-[10px] text-white/55">
        {card.name}
      </span>
    </button>
  );
});

type LibraryZoneProps = {
  topId: string | null;
  count: number;
  isOverTop: boolean;
  isOverBottom: boolean;
  isAnyDragActive: boolean;
  setTopRef: (node: HTMLDivElement | null) => void;
  setBottomRef: (node: HTMLDivElement | null) => void;
  onDraw: () => void;
};

const LibraryZone = memo(function LibraryZone({
  topId,
  count,
  isOverTop,
  isOverBottom,
  isAnyDragActive,
  setTopRef,
  setBottomRef,
  onDraw,
}: LibraryZoneProps) {
  const { state, dispatch, localPlayerId } = useGameStore();

  // --- library drag monitoring ---
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(false);

  useDndMonitor({
    onDragStart(event) {
      const data = event.active.data.current as
        | { behavior?: string }
        | undefined;
      if (data?.behavior === "move-from-library") {
        setIsDraggingFromLibrary(true);
      }
    },
    onDragEnd() {
      setIsDraggingFromLibrary(false);
    },
    onDragCancel() {
      setIsDraggingFromLibrary(false);
    },
  });

  // --- dialog state ---
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealPreviewCard, setRevealPreviewCard] =
    useState<CardHoverInfo | null>(null);
  const [revealPreviewAnchor, setRevealPreviewAnchor] =
    useState<PreviewAnchor | null>(null);
  const [millOpen, setMillOpen] = useState(false);
  const [millCount, setMillCount] = useState("1");
  const [drawOpen, setDrawOpen] = useState(false);
  const [drawCount, setDrawCount] = useState("1");
  const [scryCountOpen, setScryCountOpen] = useState(false);
  const [scryCount, setScryCount] = useState("1");
  const [scryModalOpen, setScryModalOpen] = useState(false);
  const [scryCards, setScryCards] = useState<ScryCard[]>([]);
  const [scryPreviewCard, setScryPreviewCard] = useState<CardHoverInfo | null>(
    null,
  );
  const [scryPreviewAnchor, setScryPreviewAnchor] =
    useState<PreviewAnchor | null>(null);
  const [surveilCountOpen, setSurveilCountOpen] = useState(false);
  const [surveilCount, setSurveilCount] = useState("1");
  const [surveilModalOpen, setSurveilModalOpen] = useState(false);
  const [surveilCards, setSurveilCards] = useState<SurveilCard[]>([]);
  const [surveilPreviewCard, setSurveilPreviewCard] =
    useState<CardHoverInfo | null>(null);
  const [surveilPreviewAnchor, setSurveilPreviewAnchor] =
    useState<PreviewAnchor | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [libraryViewOpen, setLibraryViewOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState("");
  const [libraryPreviewCard, setLibraryPreviewCard] =
    useState<CardHoverInfo | null>(null);
  const [libraryPreviewAnchor, setLibraryPreviewAnchor] =
    useState<PreviewAnchor | null>(null);

  // --- derived ---
  const libraryIds = state.players[localPlayerId]?.zones.library ?? [];
  const libraryViewCards = useMemo(() => {
    const normalizedFilter = libraryFilter.trim().toLowerCase();

    return libraryIds
      .map((id) => {
        const sel = selectCardWithDefinition(state, id);
        return {
          id,
          name: sel?.definition.name ?? "Carta",
          imageUrl: sel?.definition.imageUrl ?? null,
        } satisfies LibraryViewCard;
      })
      .filter((card) =>
        normalizedFilter.length === 0
          ? true
          : card.name.toLowerCase().includes(normalizedFilter),
      );
  }, [libraryFilter, libraryIds, state]);

  const topCardInfo = useMemo(() => {
    if (!topId) return null;
    const sel = selectCardWithDefinition(state, topId);
    return {
      name: sel?.definition.name ?? "Carta",
      imageUrl: sel?.definition.imageUrl ?? null,
    };
  }, [state, topId]);

  // --- handlers ---
  const handleRevealTop = () => {
    if (count === 0) return;
    dispatch({ type: "card/revealTop", playerId: localPlayerId, count: 1 });
    setRevealOpen(true);
  };

  const handleMillConfirm = () => {
    const n = Math.min(Math.max(1, Number.parseInt(millCount, 10) || 1), count);
    dispatch({ type: "card/mill", playerId: localPlayerId, count: n });
    setMillOpen(false);
    setMillCount("1");
  };

  const handleDrawConfirm = () => {
    const n = Math.min(Math.max(1, Number.parseInt(drawCount, 10) || 1), count);
    dispatch({ type: "card/draw", playerId: localPlayerId, count: n });
    setDrawOpen(false);
    setDrawCount("1");
  };

  const handleScryCountConfirm = () => {
    const n = Math.min(Math.max(1, Number.parseInt(scryCount, 10) || 1), count);
    const topCards = selectTopLibraryCards(state, localPlayerId, n);
    setScryCards(
      topCards.map((inst) => {
        const sel = selectCardWithDefinition(state, inst.id);
        return {
          id: inst.id,
          name: sel?.definition.name ?? "Carta",
          imageUrl: sel?.definition.imageUrl ?? null,
          dest: "top" as const,
        };
      }),
    );
    setScryCountOpen(false);
    setScryModalOpen(true);
  };

  const handleScryConfirm = () => {
    dispatch({
      type: "card/scry",
      playerId: localPlayerId,
      keepOnTopIds: scryCards.filter((c) => c.dest === "top").map((c) => c.id),
      putOnBottomIds: scryCards
        .filter((c) => c.dest === "bottom")
        .map((c) => c.id),
    });
    setScryModalOpen(false);
    setScryCards([]);
    setScryCount("1");
  };

  const handleSurveilCountConfirm = () => {
    const n = Math.min(
      Math.max(1, Number.parseInt(surveilCount, 10) || 1),
      count,
    );
    const topCards = selectTopLibraryCards(state, localPlayerId, n);
    setSurveilCards(
      topCards.map((inst) => {
        const sel = selectCardWithDefinition(state, inst.id);
        return {
          id: inst.id,
          name: sel?.definition.name ?? "Carta",
          imageUrl: sel?.definition.imageUrl ?? null,
          dest: "top" as const,
        };
      }),
    );
    setSurveilCountOpen(false);
    setSurveilModalOpen(true);
  };

  const handleSurveilConfirm = () => {
    dispatch({
      type: "card/surveil",
      playerId: localPlayerId,
      keepOnTopIds: surveilCards
        .filter((c) => c.dest === "top")
        .map((c) => c.id),
      putInGraveyardIds: surveilCards
        .filter((c) => c.dest === "graveyard")
        .map((c) => c.id),
    });
    setSurveilModalOpen(false);
    setSurveilCards([]);
    setSurveilCount("1");
  };

  const clearScryPreview = useCallback(() => {
    setScryPreviewCard(null);
    setScryPreviewAnchor(null);
  }, []);

  const clearSurveilPreview = useCallback(() => {
    setSurveilPreviewCard(null);
    setSurveilPreviewAnchor(null);
  }, []);

  const _clearLibraryPreview = () => {
    setLibraryPreviewCard(null);
    setLibraryPreviewAnchor(null);
  };

  const toggleScryDest = useCallback((id: string) => {
    setScryCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, dest: c.dest === "top" ? "bottom" : "top" } : c,
      ),
    );
  }, []);

  const toggleSurveilDest = useCallback((id: string) => {
    setSurveilCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, dest: c.dest === "top" ? "graveyard" : "top" }
          : c,
      ),
    );
  }, []);

  const handleScryMouseEnter = useCallback(
    (card: ScryCard, target: HTMLElement) => {
      setScryPreviewCard({ name: card.name, imageUrl: card.imageUrl });
      const rect = target.getBoundingClientRect();
      setScryPreviewAnchor({ x: rect.left + rect.width / 2, y: rect.top });
    },
    [],
  );

  const handleSurveilMouseEnter = useCallback(
    (card: SurveilCard, target: HTMLElement) => {
      setSurveilPreviewCard({ name: card.name, imageUrl: card.imageUrl });
      const rect = target.getBoundingClientRect();
      setSurveilPreviewAnchor({ x: rect.left + rect.width / 2, y: rect.top });
    },
    [],
  );

  const handleShuffle = () => {
    const library = shuffleCardIds(libraryIds);
    dispatch({
      type: "zone/shuffle",
      playerId: localPlayerId,
      zone: "library",
      orderedIds: library,
    });
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 1100);
  };

  return (
    <>
      <SideZoneShell
        label="Grimório"
        count={count}
        isOver={isOverTop || isOverBottom}
        isAnyDragActive={isAnyDragActive}
      >
        <div className="relative h-[140px] w-[100px]">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="relative flex h-full w-full items-start justify-start rounded-[8px] p-0 hover:bg-white/[0.04]"
                onClick={onDraw}
              >
                {/* Card 1 — fans left on shuffle */}
                <Image
                  src="/magic_card_back.png"
                  alt=""
                  aria-hidden
                  width={100}
                  height={140}
                  className={`absolute inset-0 h-[140px] w-[100px] rounded-[8px] ${count === 0 ? "opacity-30" : ""} ${isShuffling ? "deck-shuffle-left" : ""}`}
                  draggable={false}
                  priority={false}
                />
                {/* Card 2 — fans right on shuffle */}
                <Image
                  src="/magic_card_back.png"
                  alt=""
                  aria-hidden
                  width={100}
                  height={140}
                  className={`absolute inset-0 h-[140px] w-[100px] rounded-[8px] ${count === 0 ? "opacity-30" : ""} ${isShuffling ? "deck-shuffle-right" : ""}`}
                  draggable={false}
                  priority={false}
                />
                {/* Card 3 — top card, stays still */}
                <Image
                  src="/magic_card_back.png"
                  alt="Pilha do deck"
                  width={100}
                  height={140}
                  className={`relative h-[140px] w-[100px] rounded-[8px] ${count === 0 ? "opacity-30" : ""}`}
                  draggable={false}
                  priority={false}
                />
                {topId && <DeckTopCard cardId={topId} />}
              </Button>
            </ContextMenuTrigger>

            <ContextMenuContent className="bg-black/85">
              <ContextMenuLabel className="">Grimório</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={handleRevealTop}
                disabled={count === 0}
                className="border-b"
              >
                Reveal
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setDrawOpen(true)}
                disabled={count === 0}
                className="border-b"
              >
                Draw
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setMillOpen(true)}
                disabled={count === 0}
                className="border-b"
              >
                Mill
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setScryCountOpen(true)}
                disabled={count === 0}
                className="border-b"
              >
                Scry
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setSurveilCountOpen(true)}
                disabled={count === 0}
                className="border-b"
              >
                Surveil
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setLibraryViewOpen(true)}
                disabled={count === 0}
                className="border-b"
              >
                View in library
              </ContextMenuItem>
              <ContextMenuItem onSelect={handleShuffle} disabled={count === 0}>
                Shuffle
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {isAnyDragActive && (
            <>
              <div
                ref={setTopRef}
                className={`absolute inset-x-1 top-1 z-10 flex h-[calc(50%-6px)] items-start justify-center rounded-lg border px-1 py-1 text-[9px] font-bold uppercase tracking-[0.18em] transition ${
                  isOverTop
                    ? "border-[#9ab1e6] bg-[#4d6393]/30 text-white"
                    : "border-white/15 bg-black/30 text-white/55"
                }`}
              >
                Topo
              </div>
              <div
                ref={setBottomRef}
                className={`absolute inset-x-1 bottom-1 z-10 flex h-[calc(50%-6px)] items-start justify-center rounded-lg border px-1 py-1 text-[9px] font-bold uppercase tracking-[0.18em] transition ${
                  isOverBottom
                    ? "border-[#9ab1e6] bg-[#4d6393]/30 text-white"
                    : "border-white/15 bg-black/30 text-white/55"
                }`}
              >
                Fundo
              </div>
            </>
          )}
        </div>
      </SideZoneShell>

      {/* Reveal top */}
      <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Topo do grimório</DialogTitle>
          </DialogHeader>
          {topCardInfo && (
            <div className="flex flex-col items-center gap-3 py-2">
              {topCardInfo.imageUrl ? (
                <button
                  type="button"
                  className="bg-transparent p-0"
                  onMouseEnter={(event) => {
                    setRevealPreviewCard({
                      name: topCardInfo.name,
                      imageUrl: topCardInfo.imageUrl,
                    });
                    const rect = event.currentTarget.getBoundingClientRect();
                    setRevealPreviewAnchor({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setRevealPreviewCard(null);
                    setRevealPreviewAnchor(null);
                  }}
                >
                  <Image
                    src={topCardInfo.imageUrl}
                    alt={topCardInfo.name}
                    width={200}
                    height={279}
                    className="rounded-[10px] border border-white/10"
                    unoptimized
                  />
                </button>
              ) : (
                <p className="text-sm text-white/70">{topCardInfo.name}</p>
              )}
            </div>
          )}
          {/* <DialogFooter className="border-0">
            <Button onClick={() => setRevealOpen(false)}>Fechar</Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>

      {/* Mill */}
      <Dialog open={millOpen} onOpenChange={setMillOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Mill</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mill-count">Quantas cartas?</Label>
            <Input
              id="mill-count"
              type="number"
              min={1}
              max={count}
              value={millCount}
              onChange={(e) => setMillCount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMillConfirm();
              }}
            />
          </div>
          <DialogFooter className="border-0">
            <Button onClick={handleMillConfirm}>Mill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Draw */}
      <Dialog open={drawOpen} onOpenChange={setDrawOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Comprar cartas</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="draw-count">Quantas cartas?</Label>
            <Input
              id="draw-count"
              type="number"
              min={1}
              max={count}
              value={drawCount}
              onChange={(e) => setDrawCount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDrawConfirm();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrawOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDrawConfirm}>Comprar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scry — step 1: choose count */}
      <Dialog open={scryCountOpen} onOpenChange={setScryCountOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Scry</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="scry-count">Quantas cartas?</Label>
            <Input
              id="scry-count"
              type="number"
              min={1}
              max={count}
              value={scryCount}
              onChange={(e) => setScryCount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScryCountConfirm();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScryCountOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScryCountConfirm}>Ver cartas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scry — step 2: choose top / bottom */}
      <Dialog open={scryModalOpen} onOpenChange={setScryModalOpen}>
        <DialogContent className="max-w-2xl bg-black">
          <DialogHeader>
            <DialogTitle>
              Scry {scryCards.length} — clique para alternar topo / fundo
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-3 py-2">
            {scryCards.map((card) => (
              <ScryCardItem
                key={card.id}
                card={card}
                onToggle={toggleScryDest}
                onMouseEnter={handleScryMouseEnter}
                onMouseLeave={clearScryPreview}
              />
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScryConfirm}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={surveilCountOpen} onOpenChange={setSurveilCountOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Surveil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="surveil-count">Quantas cartas?</Label>
            <Input
              id="surveil-count"
              type="number"
              min={1}
              max={count}
              value={surveilCount}
              onChange={(e) => setSurveilCount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSurveilCountConfirm();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSurveilCountOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSurveilCountConfirm}>Ver cartas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={surveilModalOpen} onOpenChange={setSurveilModalOpen}>
        <DialogContent className="max-w-2xl bg-black">
          <DialogHeader>
            <DialogTitle>
              Surveil {surveilCards.length} — clique para alternar topo /
              cemiterio
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-3 py-2">
            {surveilCards.map((card) => (
              <SurveilCardItem
                key={card.id}
                card={card}
                onToggle={toggleSurveilDest}
                onMouseEnter={handleSurveilMouseEnter}
                onMouseLeave={clearSurveilPreview}
              />
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSurveilModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSurveilConfirm}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={libraryViewOpen}
        onOpenChange={(open) => {
          setLibraryViewOpen(open);
          if (!open) setLibraryFilter("");
        }}
      >
        <DialogContent className="flex h-[90vh] max-w-[96vw] flex-col gap-0 overflow-hidden bg-[#0d1017] p-0 sm:max-w-[92vw]">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-white/10 px-6 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
                  Grimório
                </p>
                <h2 className="mt-0.5 text-xl font-black tracking-tight text-white">
                  Ver cartas
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-white/50">
                  {libraryFilter
                    ? `${libraryViewCards.length} / ${count}`
                    : `${count} cartas`}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.09] hover:text-white"
                  onClick={() => {
                    handleShuffle();
                    setLibraryViewOpen(false);
                  }}
                >
                  Embaralhar
                </Button>
              </div>
            </div>
            <div className="relative">
              <Input
                value={libraryFilter}
                onChange={(event) => setLibraryFilter(event.target.value)}
                placeholder="Filtrar por nome..."
                className="border-white/10 bg-white/[0.04] pr-8 text-white placeholder:text-white/25 focus-visible:border-white/25 focus-visible:ring-0"
              />
              {libraryFilter && (
                <button
                  type="button"
                  onClick={() => setLibraryFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70"
                  aria-label="Limpar filtro"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] text-white/35">
              Arraste uma carta para a mao, campo, cemiterio ou exilio.
            </p>
          </div>

          {/* Card grid + drop zone overlay */}
          <div className="relative flex-1 overflow-hidden">
            {/* Scrollable card grid — dimmed while dragging */}
            <div
              className={`h-full overflow-y-auto p-5 transition-opacity duration-200 ${
                isDraggingFromLibrary ? "pointer-events-none opacity-20" : ""
              }`}
            >
              {libraryViewCards.length === 0 ? (
                <div className="flex h-full items-center justify-center py-10 text-sm text-white/30">
                  {libraryFilter
                    ? `Nenhuma carta com "${libraryFilter}".`
                    : "Grimório vazio."}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {libraryViewCards.map((card) => {
                    const globalIndex = libraryIds.indexOf(card.id);
                    return (
                      <div key={card.id} className="relative">
                        <span className="absolute -left-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/15 bg-black/80 px-1 font-mono text-[9px] font-bold text-white/60">
                          {globalIndex + 1}
                        </span>
                        <LibraryViewCardButton
                          card={card}
                          onHover={(info, target) => {
                            setLibraryPreviewCard(info);
                            if (!target) {
                              setLibraryPreviewAnchor(null);
                              return;
                            }
                            const rect = target.getBoundingClientRect();
                            setLibraryPreviewAnchor({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drop zones — appear on top while dragging */}
            {isDraggingFromLibrary && <ModalDropZoneOverlay />}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-white/10 px-6 py-3">
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
              onClick={() => {
                setLibraryViewOpen(false);
                setLibraryFilter("");
              }}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PreviewOverlay
        previewCard={revealPreviewCard}
        previewAnchor={revealPreviewAnchor}
      />
      <PreviewOverlay
        previewCard={scryPreviewCard}
        previewAnchor={scryPreviewAnchor}
      />
      <PreviewOverlay
        previewCard={surveilPreviewCard}
        previewAnchor={surveilPreviewAnchor}
      />
      <PreviewOverlay
        previewCard={libraryPreviewCard}
        previewAnchor={libraryPreviewAnchor}
      />
    </>
  );
});

// ---------------------------------------------------------------------------
// Public panel
// ---------------------------------------------------------------------------

type SideZonePanelProps = {
  graveyardTop: CardInstance | undefined;
  graveyardTopName: string;
  graveyardTopImageUrl: string | null;
  graveyardCount: number;
  graveyardIsOver: boolean;
  setGraveyardRef: (node: HTMLDivElement | null) => void;
  onViewGraveyard: () => void;
  onHoverGraveyardTop: (
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  exileTop: CardInstance | undefined;
  exileTopName: string;
  exileTopImageUrl: string | null;
  exileCount: number;
  exileIsOver: boolean;
  setExileRef: (node: HTMLDivElement | null) => void;
  onViewExile: () => void;
  onHoverExileTop: (
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  libraryTopId: string | null;
  libraryCount: number;
  libraryTopIsOver: boolean;
  libraryBottomIsOver: boolean;
  setLibraryTopRef: (node: HTMLDivElement | null) => void;
  setLibraryBottomRef: (node: HTMLDivElement | null) => void;
  isAnyDragActive: boolean;
  onDraw: () => void;
};

export const SideZonePanel = memo(function SideZonePanel({
  graveyardTop,
  graveyardTopName,
  graveyardTopImageUrl,
  graveyardCount,
  graveyardIsOver,
  setGraveyardRef,
  onViewGraveyard,
  onHoverGraveyardTop,
  exileTop,
  exileTopName,
  exileTopImageUrl,
  exileCount,
  exileIsOver,
  setExileRef,
  onViewExile,
  onHoverExileTop,
  libraryTopId,
  libraryCount,
  libraryTopIsOver,
  libraryBottomIsOver,
  setLibraryTopRef,
  setLibraryBottomRef,
  isAnyDragActive,
  onDraw,
}: SideZonePanelProps) {
  return (
    <aside className="flex flex-row gap-3 ">
      <StackZone
        zone="graveyard"
        label="Cemitério"
        top={graveyardTop}
        topName={graveyardTopName}
        topImageUrl={graveyardTopImageUrl}
        count={graveyardCount}
        isOver={graveyardIsOver}
        isAnyDragActive={isAnyDragActive}
        setRef={setGraveyardRef}
        onView={onViewGraveyard}
        onHoverTop={onHoverGraveyardTop}
      />

      <StackZone
        zone="exile"
        label="Exílio"
        top={exileTop}
        topName={exileTopName}
        topImageUrl={exileTopImageUrl}
        count={exileCount}
        isOver={exileIsOver}
        isAnyDragActive={isAnyDragActive}
        setRef={setExileRef}
        onView={onViewExile}
        onHoverTop={onHoverExileTop}
      />

      <LibraryZone
        topId={libraryTopId}
        count={libraryCount}
        isOverTop={libraryTopIsOver}
        isOverBottom={libraryBottomIsOver}
        isAnyDragActive={isAnyDragActive}
        setTopRef={setLibraryTopRef}
        setBottomRef={setLibraryBottomRef}
        onDraw={onDraw}
      />
    </aside>
  );
});
