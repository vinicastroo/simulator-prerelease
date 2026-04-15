"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
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
import { useGameStore } from "../../hooks/useGameStore";
import { DeckTopCard } from "./DeckTopCard";
import { StackTopCard } from "./StackTopCard";
import type { CardHoverInfo } from "./types";

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

function SideZoneShell({
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
      className={`flex flex-col items-start gap-2 p-3 font-mono rounded-[10px] ${
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
        <p className="text-[10px] text-white/40">{count} cartas</p>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card frame
// ---------------------------------------------------------------------------

type SideZoneCardFrameProps = {
  children: ReactNode;
};

function SideZoneCardFrame({ children }: SideZoneCardFrameProps) {
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

function StackZone({
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
      <SideZoneCardFrame>
        <div className="relative flex h-[209px] w-[150px] items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.02]">
          {top ? (
            <StackTopCard
              cardId={top.id}
              zone={zone}
              name={topName}
              imageUrl={topImageUrl}
              onHover={onHoverTop}
            />
          ) : (
            <span className="text-[10px] text-white/40">vazio</span>
          )}
        </div>
      </SideZoneCardFrame>
    </SideZoneShell>
  );
}

// ---------------------------------------------------------------------------
// Library zone with context menu
// ---------------------------------------------------------------------------

type ScryCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  dest: "top" | "bottom";
};

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

function LibraryZone({
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

  // --- dialog state ---
  const [revealOpen, setRevealOpen] = useState(false);
  const [millOpen, setMillOpen] = useState(false);
  const [millCount, setMillCount] = useState("1");
  const [drawOpen, setDrawOpen] = useState(false);
  const [drawCount, setDrawCount] = useState("1");
  const [scryCountOpen, setScryCountOpen] = useState(false);
  const [scryCount, setScryCount] = useState("1");
  const [scryModalOpen, setScryModalOpen] = useState(false);
  const [scryCards, setScryCards] = useState<ScryCard[]>([]);

  // --- derived ---
  const libraryIds = state.players[localPlayerId]?.zones.library ?? [];

  const topCardInfo = topId
    ? (() => {
        const sel = selectCardWithDefinition(state, topId);
        return {
          name: sel?.definition.name ?? "Carta",
          imageUrl: sel?.definition.imageUrl ?? null,
        };
      })()
    : null;

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

  const toggleScryDest = (id: string) => {
    setScryCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, dest: c.dest === "top" ? "bottom" : "top" } : c,
      ),
    );
  };

  const handleShuffle = () => {
    const library = shuffleCardIds(libraryIds);
    dispatch({
      type: "zone/shuffle",
      playerId: localPlayerId,
      zone: "library",
      orderedIds: library,
    });
  };

  return (
    <>
      <SideZoneShell
        label="Grimório"
        count={count}
        isOver={isOverTop || isOverBottom}
        isAnyDragActive={isAnyDragActive}
      >
        <SideZoneCardFrame>
          <div className="relative h-full w-full">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="relative flex h-full w-full items-start justify-start rounded-2xl p-0 hover:bg-white/[0.04]"
                  onClick={onDraw}
                >
                  <Image
                    src="/magic_card_back.png"
                    alt="Pilha do deck"
                    width={150}
                    height={209}
                    className={`h-[209px] w-[150px] rounded-[8px]  ${count === 0 ? "opacity-30" : ""}`}
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
                  onSelect={handleShuffle}
                  disabled={count === 0}
                >
                  Shuffle
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            {isAnyDragActive && (
              <>
                <div
                  ref={setTopRef}
                  className={`absolute inset-x-3 top-3 z-10 flex h-[calc(50%-1rem)] items-start justify-center rounded-xl border px-2 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
                    isOverTop
                      ? "border-[#9ab1e6] bg-[#4d6393]/30 text-white"
                      : "border-white/15 bg-black/30 text-white/55"
                  }`}
                >
                  Topo
                </div>
                <div
                  ref={setBottomRef}
                  className={`absolute inset-x-3 bottom-3 z-10 flex h-[calc(50%-1rem)] items-start justify-center rounded-xl border px-2 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
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
        </SideZoneCardFrame>
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
                <Image
                  src={topCardInfo.imageUrl}
                  alt={topCardInfo.name}
                  width={200}
                  height={279}
                  className="rounded-[10px] border border-white/10"
                  unoptimized
                />
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
        <DialogContent>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Scry {scryCards.length} — clique para alternar topo / fundo
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-3 py-2">
            {scryCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => toggleScryDest(card.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
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
    </>
  );
}

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

export function SideZonePanel({
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
}
