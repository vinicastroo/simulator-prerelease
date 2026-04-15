"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type PlacedCardState,
  usePrerelease,
} from "@/context/PrereleaseContext";

// ─── Rarity helpers ───────────────────────────────────────────────────────────

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-white/40",
  UNCOMMON: "bg-slate-400",
  RARE: "bg-yellow-400",
  MYTHIC: "bg-orange-500",
};

const RARITY_ORDER: Record<string, number> = {
  MYTHIC: 0,
  RARE: 1,
  UNCOMMON: 2,
  COMMON: 3,
};

const SIDEBAR_CARD_NAME_LIMIT = 30;

function truncateSidebarCardName(name: string) {
  if (name.length <= SIDEBAR_CARD_NAME_LIMIT) return name;
  return `${name.slice(0, SIDEBAR_CARD_NAME_LIMIT - 3)}...`;
}

function sortCards(cards: PlacedCardState[]) {
  return [...cards].sort(
    (a, b) =>
      (RARITY_ORDER[a.card.rarity] ?? 4) - (RARITY_ORDER[b.card.rarity] ?? 4) ||
      a.card.cmc - b.card.cmc ||
      a.card.name.localeCompare(b.card.name),
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const router = useRouter();
  const {
    cards,
    isPending,
    kitId,
    draggingCardId,
    setDeckZone,
    setDraggingCard,
    addBasicLandsToKit,
  } = usePrerelease();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBasicLandsOpen, setIsBasicLandsOpen] = useState(false);
  const [sidebarToast, setSidebarToast] = useState<string | null>(null);
  const [isOversizeDeckDialogOpen, setIsOversizeDeckDialogOpen] =
    useState(false);

  const mainDeck = sortCards(cards.filter((c) => c.isMainDeck === true));
  const sideboard = sortCards(cards.filter((c) => c.isMainDeck === false));
  const groupedMainDeck = groupDeckCards(mainDeck);
  const groupedSideboard = groupDeckCards(sideboard);
  const creatureCount = mainDeck.filter((c) =>
    c.card.typeLine.includes("Creature"),
  ).length;
  const curveEntries = getManaCurve(mainDeck);

  const mainZoneRef = useRef<HTMLElement>(null);
  const sideZoneRef = useRef<HTMLElement>(null);

  // ── Preview tooltip + full overview ──
  const [preview, setPreview] = useState<{
    card: PlacedCardState;
    anchorY: number;
  } | null>(null);
  const [viewing, setViewing] = useState<PlacedCardState | null>(null);
  const [activeSidebarDropZone, setActiveSidebarDropZone] = useState<
    "main" | "side" | null
  >(null);
  const [draggingSidebarCardId, setDraggingSidebarCardId] = useState<
    string | null
  >(null);

  // Prefetch the playtest route while the user is still on the simulator so
  // the navigation feels instant when they click the Playtest button.
  useEffect(() => {
    if (kitId) {
      router.prefetch(`/playtest/${kitId}`);
    }
  }, [kitId, router]);

  useEffect(() => {
    if (!sidebarToast) return;

    const timeoutId = window.setTimeout(() => {
      setSidebarToast(null);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [sidebarToast]);

  const handlePlaytestClick = useCallback(() => {
    if (mainDeck.length > 40) {
      setIsOversizeDeckDialogOpen(true);
      return;
    }

    router.push(`/playtest/${kitId}`);
  }, [kitId, mainDeck.length, router]);

  const handleForcePlaytest = useCallback(() => {
    setIsOversizeDeckDialogOpen(false);
    router.push(`/playtest/${kitId}`);
  }, [kitId, router]);

  const handleHover = useCallback((card: PlacedCardState, anchorY: number) => {
    setPreview({ card, anchorY });
  }, []);
  const handleHoverEnd = useCallback(() => setPreview(null), []);
  const handleOpen = useCallback((card: PlacedCardState) => {
    setPreview(null);
    setViewing(card);
  }, []);

  // Close the overview when the viewed card leaves the deck (dragged to canvas).
  useEffect(() => {
    if (!viewing) return;
    const stillInDeck = cards.some(
      (c) => c.id === viewing.id && c.isMainDeck !== null,
    );
    if (!stillInDeck) setViewing(null);
  }, [cards, viewing]);

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

      main.dataset.active = String(
        x >= mr.left && x <= mr.right && y >= mr.top && y <= mr.bottom,
      );
      side.dataset.active = String(
        x >= sr.left && x <= sr.right && y >= sr.top && y <= sr.bottom,
      );
    };

    document.addEventListener("pointermove", track, { passive: true });
    return () => document.removeEventListener("pointermove", track);
  }, [draggingCardId]);

  if (isCollapsed) {
    return (
      <aside style={{ width: 68, minWidth: 68 }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,98,153,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_20%)]" />
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => setIsCollapsed(false)}
          className={`relative mt-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#111315]/90 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-all ${
            draggingCardId
              ? "border-[#4d6393]/70 text-[#a9b9df] ring-2 ring-[#31456f]/35"
              : "border-[#30476f]/55 text-[#8ea4d6] hover:-translate-y-0.5 hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
          }`}
          title="Expandir sidebar"
          aria-label="Expandir sidebar"
          onDragOver={(e) => {
            if (hasDraggedPlacedCards(e.dataTransfer)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDrop={(e) => {
            const ids = getDraggedPlacedCardIds(e.dataTransfer);
            if (ids.length === 0) return;
            e.preventDefault();
            setDeckZone(ids, true);
            setDraggingCard(null);
          }}
        >
          <DeckIcon className="h-5 w-5" />
        </Button>
      </aside>
    );
  }

  // ── Drop zone mode ──────────────────────────────────────────────────────────
  if (draggingCardId) {
    return (
      <aside
        style={{ width: 300, minWidth: 300 }}
        className="relative flex h-full flex-col overflow-hidden border-l border-[#2a3f66]/55 bg-[#121416]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,98,153,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_20%)]" />
        <div className="relative flex items-start justify-between gap-3 border-b border-[#2f446d]/45 px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7f95c9]">
              Deck Zones
            </p>
            <p className="mt-1 text-[11px] text-white/30">
              Solte a carta em uma das áreas abaixo
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-9 w-9 rounded-xl border-[#30476f]/55 bg-[#0f1113]/80 text-[#8ea4d6] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
            title="Minimizar sidebar"
          >
            ›
          </Button>
        </div>

        <DropZonePanel
          ref={mainZoneRef}
          dataZone="main"
          label="Main Deck"
          count={mainDeck.length}
          colorClass="data-[active=true]:bg-blue-500/15 data-[active=true]:border-blue-400/60"
          icon="⚔️"
          onDropCard={(ids) => {
            setDeckZone(ids, true);
            setDraggingCard(null);
          }}
        />

        <div className="h-px bg-gradient-to-r from-transparent via-[#31456f]/70 to-transparent flex-shrink-0" />

        <DropZonePanel
          ref={sideZoneRef}
          dataZone="side"
          label="Sideboard"
          count={sideboard.length}
          colorClass="data-[active=true]:bg-purple-500/15 data-[active=true]:border-purple-400/60"
          icon="🛡️"
          onDropCard={(ids) => {
            setDeckZone(ids, false);
            setDraggingCard(null);
          }}
        />

        <div className="relative px-4 py-3 text-[11px] text-white/25 text-center flex-shrink-0 border-t border-white/5">
          Solte sobre uma zona para adicionar
        </div>
      </aside>
    );
  }

  // ── List mode ───────────────────────────────────────────────────────────────
  const landCount = mainDeck.filter((c) =>
    c.card.typeLine.includes("Land"),
  ).length;
  const spellCount = mainDeck.length - landCount;

  return (
    <>
      <aside
        style={{ width: 300, minWidth: 300 }}
        className="relative flex flex-col h-full overflow-hidden border-l border-[#2a3f66]/55 bg-[#121416]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,98,153,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%)]" />

        <div className="relative flex items-start justify-between border-b border-[#2f446d]/45 px-4 py-4 flex-shrink-0">
          <div>
            <Badge
              variant="outline"
              className="border-[#30476f]/55 bg-[#162032]/70 text-[#9bb0e0]"
            >
              Workshop
            </Badge>
            <h2 className="mt-2 text-[#e5edff] font-semibold tracking-wider text-sm uppercase">
              Deck Builder
            </h2>
            <p className="text-white/35 text-[11px] mt-0.5">
              Arraste cartas para adicionar
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 rounded-xl border border-[#3c5d8f]/45 bg-[#20304f]/70 text-[#d7e4ff] hover:bg-[#2a3d64]"
                onClick={handlePlaytestClick}
              >
                Playtest
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-xl border border-[#3c5d8f]/30 bg-transparent text-[#91a7da] hover:bg-[#20304f]/50 hover:text-[#d7e4ff]"
                onClick={() => router.push("/game")}
              >
                Jogar com amigos
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPending && (
              <Badge className="animate-pulse border-[#30476f]/55 bg-[#20304f]/55 text-[#c7d5f8]">
                Salvando
              </Badge>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-9 w-9 rounded-xl border-[#30476f]/55 bg-[#0f1113]/80 text-[#8ea4d6] hover:bg-[#233455]/45 hover:text-[#b8c6e6]"
              title="Minimizar sidebar"
            >
              ›
            </Button>
          </div>
        </div>

        <ScrollArea className="relative mt-8 h-0 flex-1 [scrollbar-color:#31456f_transparent] [scrollbar-width:thin]">
          <div className="min-h-full px-3 pb-3">
            <Card className="overflow-hidden rounded-[22px] border border-[#30476f]/30 bg-[#15191d]/88 shadow-none ring-0">
              <CardHeader className="border-b border-[#30476f]/30 pb-2">
                <CardTitle className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#7f95c9]">
                  Resumo do Deck
                </CardTitle>
                <CardDescription className="text-[10px] text-white/28">
                  Estado atual da build principal
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-1.5 pt-3">
                <SummaryMetricRow
                  label="Total"
                  value={`${mainDeck.length}/40`}
                  accent
                />
                <Separator className="bg-[#30476f]/30" />
                <SummaryMetricRow label="Main" value={mainDeck.length} />
                <SummaryMetricRow label="Sideboard" value={sideboard.length} />
                <SummaryMetricRow label="Criaturas" value={creatureCount} />
                <SummaryMetricRow label="Feitiços" value={spellCount} />
                <SummaryMetricRow label="Terrenos" value={landCount} />
              </CardContent>
            </Card>

            <Card className="mt-3 overflow-hidden rounded-[22px] border border-[#30476f]/30 bg-[#15191d]/88 shadow-none ring-0">
              <CardHeader className="border-b border-[#30476f]/30 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#7f95c9]">
                    Curva de Mana
                  </CardTitle>
                  <span className="font-mono text-[8px] text-white/25">
                    Main Deck
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-3">
                <div className="grid grid-cols-7 items-end gap-1.5">
                  {curveEntries.map((entry) => (
                    <ManaCurveBar
                      key={entry.label}
                      label={entry.label}
                      value={entry.value}
                      max={curveEntries.maxValue}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <button
              type="button"
              onClick={() => setIsBasicLandsOpen(true)}
              className="mt-3 flex w-full items-center justify-between rounded-[20px] bg-[#15191d]/80 px-3.5 py-3 text-left shadow-[0_0_0_1px_rgba(49,69,111,0.26)] transition-colors hover:bg-[#18202a]"
            >
              <div className="min-w-0 text-left">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#7f95c9]">
                  Terrenos Básicos
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  {["W", "U", "B", "R", "G"].map((c) => (
                    <img
                      key={c}
                      src={`/${c}.svg`}
                      alt={c}
                      width={12}
                      height={12}
                      className="opacity-70"
                    />
                  ))}
                </div>
              </div>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-[#30476f]/45 bg-[#162032]/75 px-2 font-mono text-[10px] text-[#b7c5e8]">
                +
              </span>
            </button>

            <DeckSection
              ref={mainZoneRef}
              label="Main Deck"
              count={mainDeck.length}
              dataZone="main"
              isActive={activeSidebarDropZone === "main"}
              isDragging={!!draggingSidebarCardId}
              onActivate={() => setActiveSidebarDropZone("main")}
              onDeactivate={() =>
                setActiveSidebarDropZone((prev) =>
                  prev === "main" ? null : prev,
                )
              }
              onDropCard={(ids) => {
                setDeckZone(ids, true);
                setActiveSidebarDropZone(null);
                setDraggingSidebarCardId(null);
              }}
            >
              {mainDeck.length === 0 ? (
                <EmptySlot message="Arraste cartas aqui" />
              ) : (
                <ul className="flex flex-col overflow-hidden rounded-b-[22px] bg-[#14181b]/78 shadow-[0_0_0_1px_rgba(49,69,111,0.34)]">
                  {groupedMainDeck.map((group) => (
                    <CardRow
                      key={group.key}
                      card={group.card}
                      count={group.count}
                      dragIds={group.ids}
                      isDragging={group.ids.includes(
                        draggingSidebarCardId ?? "",
                      )}
                      onHover={handleHover}
                      onHoverEnd={handleHoverEnd}
                      onOpen={handleOpen}
                      onDragStateChange={setDraggingSidebarCardId}
                    />
                  ))}
                </ul>
              )}
            </DeckSection>

            <DeckSection
              ref={sideZoneRef}
              label="Sideboard"
              count={sideboard.length}
              dataZone="side"
              isActive={activeSidebarDropZone === "side"}
              isDragging={!!draggingSidebarCardId}
              onActivate={() => setActiveSidebarDropZone("side")}
              onDeactivate={() =>
                setActiveSidebarDropZone((prev) =>
                  prev === "side" ? null : prev,
                )
              }
              onDropCard={(ids) => {
                setDeckZone(ids, false);
                setActiveSidebarDropZone(null);
                setDraggingSidebarCardId(null);
              }}
            >
              {sideboard.length === 0 ? (
                <EmptySlot message="Arraste cartas aqui" />
              ) : (
                <ul className="flex flex-col overflow-hidden rounded-b-[22px] bg-[#14181b]/78 shadow-[0_0_0_1px_rgba(49,69,111,0.34)]">
                  {groupedSideboard.map((group) => (
                    <CardRow
                      key={group.key}
                      card={group.card}
                      count={group.count}
                      dragIds={group.ids}
                      isDragging={group.ids.includes(
                        draggingSidebarCardId ?? "",
                      )}
                      onHover={handleHover}
                      onHoverEnd={handleHoverEnd}
                      onOpen={handleOpen}
                      onDragStateChange={setDraggingSidebarCardId}
                    />
                  ))}
                </ul>
              )}
            </DeckSection>

            <div className="h-8" />
          </div>
        </ScrollArea>
      </aside>

      <AnimatePresence>
        {preview && !viewing && (
          <CardPreviewTooltip card={preview.card} anchorY={preview.anchorY} />
        )}
      </AnimatePresence>

      <CardDialog
        card={viewing}
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) {
            setViewing(null);
          }
        }}
      />

      <BasicLandsSheet
        open={isBasicLandsOpen}
        isPending={isPending}
        onOpenChange={setIsBasicLandsOpen}
        onAdd={(landName, quantity) => {
          addBasicLandsToKit(landName, quantity);
          setSidebarToast(
            `${quantity} ${landName}${quantity > 1 ? "s" : ""} adicionado${quantity > 1 ? "s" : ""} ao deck`,
          );
        }}
      />

      <Dialog
        open={isOversizeDeckDialogOpen}
        onOpenChange={setIsOversizeDeckDialogOpen}
      >
        <DialogContent className="max-w-[420px] border-white/10 bg-[#101317] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-[-0.03em] text-white">
              Deck com mais de 40 cartas
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-white/55">
              Seu deck principal esta com {mainDeck.length} cartas. O
              recomendado para o playtest eh usar 40 cartas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06]"
              onClick={() => setIsOversizeDeckDialogOpen(false)}
            >
              Voltar e ajustar
            </Button>
            <Button
              type="button"
              className="bg-[#4d6393] text-white hover:bg-[#5f77ab]"
              onClick={handleForcePlaytest}
            >
              Testar o deck mesmo assim
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {sidebarToast ? (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[220000000] flex justify-center px-4">
          <div className="rounded-xl border border-white/10 bg-[#0e131a]/92 px-4 py-2 text-sm font-medium text-white shadow-2xl backdrop-blur-md">
            {sidebarToast}
          </div>
        </div>
      ) : null}
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
  onDropCard: (ids: string[]) => void;
}

const DropZonePanel = forwardRef<HTMLElement, DropZonePanelProps>(
  function DropZonePanel(
    { dataZone, label, count, colorClass, icon, onDropCard },
    ref,
  ) {
    return (
      <section
        ref={ref}
        aria-label={label}
        data-zone={dataZone}
        data-active="false"
        className={`relative m-3 flex flex-1 flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-[#30476f]/55 bg-[#14181b]/82 px-4 transition-all duration-150 ${colorClass}`}
        onDragOver={(e) => {
          if (hasDraggedPlacedCards(e.dataTransfer)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }
        }}
        onDrop={(e) => {
          const ids = getDraggedPlacedCardIds(e.dataTransfer);
          if (ids.length === 0) return;
          e.preventDefault();
          onDropCard(ids);
        }}
      >
        <Card className="pointer-events-none absolute inset-0 rounded-[24px] border-0 bg-transparent shadow-none">
          <div className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-white/[0.03] to-transparent" />
        </Card>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-current bg-white/[0.03] text-3xl opacity-50">
          {icon}
        </div>
        <div className="relative text-center">
          <p className="text-white/80 text-sm font-semibold tracking-wide">
            {label}
          </p>
          <p className="text-white/30 text-xs mt-0.5">
            {count} carta{count !== 1 ? "s" : ""}
          </p>
        </div>
      </section>
    );
  },
);

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  label: string;
  count: number;
  dataZone?: string;
  isActive?: boolean;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader({ label, count, dataZone, isActive = false }, ref) {
    return (
      <div
        ref={ref}
        data-zone={dataZone}
        data-active="false"
        className={`sticky top-0 z-10 flex items-center justify-between rounded-t-[22px] border-b px-3.5 py-2 backdrop-blur-md transition-colors ${
          isActive
            ? "border-[#4d6393]/35 bg-[#1a2433]/95"
            : "border-[#30476f]/30 bg-[#10151b]/95"
        }`}
      >
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[#7f95c9]">
          {label}
        </span>
        <Badge
          variant="outline"
          className="border-white/10 bg-white/[0.03] font-mono text-[10px] text-white/60 tabular-nums"
        >
          {count}
        </Badge>
      </div>
    );
  },
);

// ─── Card row ─────────────────────────────────────────────────────────────────

function CardRow({
  card,
  count = 1,
  dragIds,
  isDragging = false,
  onHover,
  onHoverEnd,
  onOpen,
  onDragStateChange,
}: {
  card: PlacedCardState;
  count?: number;
  dragIds: string[];
  isDragging?: boolean;
  onHover?: (card: PlacedCardState, anchorY: number) => void;
  onHoverEnd?: () => void;
  onOpen?: (card: PlacedCardState) => void;
  onDragStateChange?: (id: string | null) => void;
}) {
  return (
    <li
      draggable
      className={`group relative flex w-full cursor-pointer items-center gap-2.5 border-b border-[#30476f]/40 px-3 py-2.5 transition-all last:border-b-0 ${
        isDragging
          ? "z-10 scale-[1.015] border-[#4d6393]/60 bg-[#1b2432]/95 opacity-100 shadow-[0_10px_24px_rgba(0,0,0,0.28),0_0_0_1px_rgba(77,99,147,0.42)]"
          : "hover:bg-white/[0.045]"
      } ${isDragging ? "cursor-grabbing" : ""}
        `}
      onMouseEnter={(e) =>
        onHover?.(card, e.currentTarget.getBoundingClientRect().top)
      }
      onMouseLeave={() => onHoverEnd?.()}
      onDoubleClick={() => onOpen?.(card)}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/x-placed-card-id",
          dragIds[0] ?? card.id,
        );
        e.dataTransfer.setData(
          "application/x-placed-card-ids",
          JSON.stringify(dragIds),
        );
        e.dataTransfer.effectAllowed = "move";
        const dragPreview = createDragPreview(card, count);
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 18, 24);
        requestAnimationFrame(() => {
          dragPreview.remove();
        });
        onDragStateChange?.(dragIds[0] ?? card.id);
      }}
      onDragEnd={() => onDragStateChange?.(null)}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-[linear-gradient(90deg,rgba(77,99,147,0.18),transparent_40%,rgba(255,255,255,0.03))]" />
      )}

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${RARITY_DOT[card.card.rarity] ?? "bg-white/20"} ${isDragging ? "opacity-100" : ""}`}
        />

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-1.5 overflow-hidden">
            {count > 1 && (
              <span
                className={`font-mono text-[10px] font-semibold leading-none ${isDragging ? "text-[#d5e2ff]" : "text-[#8ea4d6]"}`}
              >
                {count}x
              </span>
            )}
            <span
              title={card.card.name}
              className={`block min-w-0 flex-1 basis-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-none ${isDragging ? "text-white" : "text-white/78"}`}
            >
              {truncateSidebarCardName(card.card.name)}
            </span>
            {card.isFoil && (
              <span
                className={`text-[9px] leading-none ${isDragging ? "text-[#d5e2ff]" : "text-[#8ea4d6]"}`}
              >
                ★
              </span>
            )}
          </div>

          <div
            className={`flex flex-shrink-0 items-center gap-1.5 ${isDragging ? "opacity-100" : ""}`}
          >
            <ManaCost
              cost={card.card.manaCost}
              colors={card.card.colors as string[]}
              cmc={card.card.cmc}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function groupDeckCards(cards: PlacedCardState[]) {
  const groups = new Map<
    string,
    { key: string; card: PlacedCardState; count: number; ids: string[] }
  >();

  for (const card of cards) {
    const key = `${card.cardId}:${card.isFoil ? "foil" : "nonfoil"}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      existing.ids.push(card.id);
      continue;
    }

    groups.set(key, {
      key,
      card,
      count: 1,
      ids: [card.id],
    });
  }

  return Array.from(groups.values());
}

function createDragPreview(card: PlacedCardState, count: number) {
  const preview = document.createElement("div");
  preview.style.position = "fixed";
  preview.style.left = "-9999px";
  preview.style.top = "-9999px";
  preview.style.width = "36px";
  preview.style.height = "52px";
  preview.style.borderRadius = "8px";
  preview.style.overflow = "hidden";
  preview.style.background = "#0f1318";
  preview.style.backgroundImage = card.card.imagePath
    ? `url("${card.card.imagePath}")`
    : "";
  preview.style.backgroundSize = "cover";
  preview.style.backgroundPosition = "center";
  preview.style.backgroundRepeat = "no-repeat";
  preview.style.boxShadow =
    "0 10px 24px rgba(0,0,0,0.32), 0 0 0 1px rgba(77,99,147,0.34)";
  preview.style.border = "1px solid rgba(77,99,147,0.28)";

  if (!card.card.imagePath) {
    const fallback = document.createElement("div");
    fallback.textContent = card.card.name;
    fallback.style.display = "flex";
    fallback.style.width = "100%";
    fallback.style.height = "100%";
    fallback.style.alignItems = "center";
    fallback.style.justifyContent = "center";
    fallback.style.padding = "4px";
    fallback.style.color = "rgba(255,255,255,0.7)";
    fallback.style.fontSize = "8px";
    fallback.style.fontFamily = "monospace";
    fallback.style.textAlign = "center";
    preview.appendChild(fallback);
  }

  if (count > 1) {
    const badge = document.createElement("div");
    badge.textContent = `${count}x`;
    badge.style.position = "absolute";
    badge.style.right = "3px";
    badge.style.bottom = "3px";
    badge.style.padding = "2px 4px";
    badge.style.borderRadius = "999px";
    badge.style.background = "rgba(17,22,29,0.88)";
    badge.style.border = "1px solid rgba(77,99,147,0.34)";
    badge.style.color = "#d5e2ff";
    badge.style.fontSize = "8px";
    badge.style.lineHeight = "1";
    badge.style.fontFamily = "monospace";
    badge.style.fontWeight = "700";
    preview.appendChild(badge);
  }

  return preview;
}

function hasDraggedPlacedCards(dataTransfer: DataTransfer) {
  return (
    dataTransfer.types.includes("application/x-placed-card-ids") ||
    dataTransfer.types.includes("application/x-placed-card-id")
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
      // fall through to single id
    }
  }

  const id = dataTransfer.getData("application/x-placed-card-id");
  return id ? [id] : [];
}

function ManaCost({
  cost,
  colors,
  cmc,
}: {
  cost?: string | null;
  colors: string[];
  cmc: number;
}) {
  const tokens = parseManaCost(cost);
  const fallbackTokens = buildFallbackManaTokens(colors, cmc);
  const createTokenEntries = (values: string[]) => {
    const counts = new Map<string, number>();

    return values.map((token) => {
      const occurrence = (counts.get(token) ?? 0) + 1;
      counts.set(token, occurrence);

      return { token, key: `${token}-${occurrence}` };
    });
  };
  const fallbackEntries = createTokenEntries(fallbackTokens);
  const tokenEntries = createTokenEntries(tokens);

  if (tokens.length === 0) {
    if (fallbackTokens.length === 0) {
      return (
        <span className="font-mono text-[8px] uppercase text-white/24">C</span>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {fallbackEntries.map(({ token, key }) => {
          const src = MANA_ICON_SRC[token];
          if (!src) return null;

          return (
            <span
              key={key}
              className="relative h-2.5 w-2.5 flex-shrink-0 opacity-80"
            >
              <Image src={src} alt={token} fill className="object-contain" />
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {tokenEntries.map(({ token, key }) => {
        const src = MANA_ICON_SRC[token];
        if (!src) {
          return (
            <span
              key={key}
              className="font-mono text-[8px] uppercase text-white/24"
            >
              {token}
            </span>
          );
        }

        return (
          <span
            key={key}
            className="relative h-2.5 w-2.5 flex-shrink-0 opacity-85"
          >
            <Image src={src} alt={token} fill className="object-contain" />
          </span>
        );
      })}
    </div>
  );
}

function SummaryMetricRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <p
        className={`font-mono text-[8px] uppercase tracking-[0.1em] ${accent ? "text-[#8ea4d6]" : "text-white/34"}`}
      >
        {label}
      </p>
      <p
        className={`font-mono text-[11px] font-semibold tabular-nums ${accent ? "text-[#d8e4ff]" : "text-white/72"}`}
      >
        {value}
      </p>
    </div>
  );
}

function BasicLandRow({
  name,
  label,
  symbol,
  disabled,
  onAdd,
}: {
  name: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest";
  label: string;
  symbol: "W" | "U" | "B" | "R" | "G";
  disabled: boolean;
  onAdd: (quantity: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#14191f] px-2.5 py-2 shadow-[0_0_0_1px_rgba(49,69,111,0.22)]">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative h-3.5 w-3.5 flex-shrink-0 opacity-90">
          <Image
            src={MANA_ICON_SRC[symbol]}
            alt={label}
            fill
            className="object-contain"
          />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/72">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={() => onAdd(1)}
          className="rounded-full border-[#30476f]/45 bg-[#162032] font-mono text-[9px] font-semibold text-[#b7c5e8] hover:bg-[#1c2941]"
          aria-label={`Adicionar 1 ${name}`}
        >
          +1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={() => onAdd(5)}
          className="rounded-full border-[#30476f]/45 bg-[#162032] font-mono text-[9px] font-semibold text-[#b7c5e8] hover:bg-[#1c2941]"
          aria-label={`Adicionar 5 ${name}`}
        >
          +5
        </Button>
      </div>
    </div>
  );
}

function BasicLandsSheet({
  open,
  isPending,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    landName: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest",
    quantity: number,
  ) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="z-[210000000] w-full max-w-[340px] border-l border-[#30476f]/40 bg-[#101317] p-0 text-white sm:max-w-[340px]"
      >
        <SheetHeader className="border-b border-[#30476f]/30 px-4 py-4">
          <SheetTitle className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#7f95c9]">
            Terrenos Básicos
          </SheetTitle>
          <SheetDescription className="font-mono text-[10px] text-white/34">
            Adiciona direto no main deck
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-1.5 p-3">
          {BASIC_LANDS.map((land) => (
            <BasicLandRow
              key={land.name}
              name={land.name}
              label={land.label}
              symbol={land.symbol}
              disabled={isPending}
              onAdd={(quantity) => onAdd(land.name, quantity)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Empty slot ───────────────────────────────────────────────────────────────

function EmptySlot({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-b-[22px] bg-[#14181b]/78 px-4 py-8">
      <div className="flex w-full items-center justify-center rounded-[18px] border border-dashed border-[#30476f]/35 bg-[#10151b]/55 px-4 py-6">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/26">
          {message}
        </p>
      </div>
    </div>
  );
}

const DeckSection = forwardRef<
  HTMLElement,
  {
    label: string;
    count: number;
    dataZone: "main" | "side";
    isActive: boolean;
    isDragging?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
    onDropCard: (ids: string[]) => void;
    children: React.ReactNode;
  }
>(function DeckSection(
  {
    label,
    count,
    dataZone,
    isActive,
    isDragging = false,
    onActivate,
    onDeactivate,
    onDropCard,
    children,
  },
  ref,
) {
  return (
    <section
      ref={ref}
      aria-label={label}
      data-zone={dataZone}
      className={`relative mt-3 overflow-hidden rounded-[22px] border transition-all duration-150 ${
        isActive
          ? "scale-[1.01] border-[#4d93e8]/55 bg-[#1a2433]/40 shadow-[0_0_0_1px_rgba(77,147,232,0.18),0_12px_24px_rgba(0,0,0,0.18)]"
          : isDragging
            ? "border-[#4d6393]/60 bg-[#151c28]/30 shadow-[0_0_0_1px_rgba(77,99,147,0.12)]"
            : "border-[#30476f]/34"
      }`}
      onDragOver={(e) => {
        if (hasDraggedPlacedCards(e.dataTransfer)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          onActivate();
        }
      }}
      onDragEnter={(e) => {
        if (hasDraggedPlacedCards(e.dataTransfer)) {
          onActivate();
        }
      }}
      onDragLeave={(e) => {
        const related = e.relatedTarget as Node | null;
        if (!related || !e.currentTarget.contains(related)) {
          onDeactivate();
        }
      }}
      onDrop={(e) => {
        const ids = getDraggedPlacedCardIds(e.dataTransfer);
        if (ids.length === 0) return;
        e.preventDefault();
        onDropCard(ids);
      }}
    >
      {isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(180deg,rgba(77,147,232,0.14),transparent_40%,rgba(77,147,232,0.06))]" />
      )}
      {isDragging && !isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(180deg,rgba(77,99,147,0.07),transparent_50%)]" />
      )}
      <SectionHeader
        label={label}
        count={count}
        dataZone={dataZone}
        isActive={isActive}
      />
      {children}
    </section>
  );
});

function ManaCurveBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const height = max > 0 ? Math.max(4, (value / max) * 48) : 4;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[8px] text-white/32">{value}</span>
      <div className="flex h-12 w-full items-end rounded-full bg-white/[0.03] px-[2px] pb-[2px]">
        <div
          className="w-full rounded-full bg-[#4d6393]/85"
          style={{ height }}
        />
      </div>
      <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-white/24">
        {label}
      </span>
    </div>
  );
}

function DeckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="4" width="11" height="16" rx="2.2" />
      <path d="M9 8h5.5" />
      <path d="M9 11.5h5.5" />
      <path d="M9 15h3.5" />
      <path d="M17 7.5 19.5 9v9a2 2 0 0 1-2 2H10" />
    </svg>
  );
}

// ─── Color bar helper ─────────────────────────────────────────────────────────

const MANA_ICON_SRC: Record<string, string> = {
  "0": "/0.svg",
  "1": "/1.svg",
  "2": "/2.svg",
  "3": "/3.svg",
  "4": "/4.svg",
  "5": "/5.svg",
  "6": "/6.svg",
  "7": "/7.svg",
  "8": "/8.svg",
  "9": "/9.svg",
  "10": "/10.svg",
  "11": "/11.svg",
  "12": "/12.svg",
  "13": "/13.svg",
  "14": "/14.svg",
  "15": "/15.svg",
  "16": "/16.svg",
  "17": "/17.svg",
  "18": "/18.svg",
  "19": "/19.svg",
  "20": "/20.svg",
  W: "/W.svg",
  U: "/U.svg",
  B: "/B.svg",
  R: "/R.svg",
  G: "/G.svg",
};

const BASIC_LANDS = [
  { name: "Plains", label: "Planície", symbol: "W" },
  { name: "Island", label: "Ilha", symbol: "U" },
  { name: "Swamp", label: "Pântano", symbol: "B" },
  { name: "Mountain", label: "Montanha", symbol: "R" },
  { name: "Forest", label: "Floresta", symbol: "G" },
] as const;

function parseManaCost(cost?: string | null): string[] {
  if (!cost) return [];
  return Array.from(cost.matchAll(/\{([^}]+)\}/g), ([, token]) =>
    token.toUpperCase(),
  );
}

function buildFallbackManaTokens(colors: string[], cmc: number): string[] {
  const generic = Math.max(cmc - colors.length, 0);
  const tokens: string[] = [];

  if (generic > 0) {
    tokens.push(String(generic));
  }

  tokens.push(...colors.map((color) => color.toUpperCase()));
  return tokens;
}

function getManaCurve(cards: PlacedCardState[]) {
  const buckets = [
    { label: "0", value: 0 },
    { label: "1", value: 0 },
    { label: "2", value: 0 },
    { label: "3", value: 0 },
    { label: "4", value: 0 },
    { label: "5", value: 0 },
    { label: "6+", value: 0 },
  ];

  for (const card of cards) {
    if (card.card.typeLine.includes("Land")) continue;
    const bucketIndex = Math.min(card.card.cmc, 6);
    buckets[bucketIndex].value += 1;
  }

  const maxValue = Math.max(0, ...buckets.map((bucket) => bucket.value));
  return Object.assign(buckets, { maxValue });
}

function CardPreviewTooltip({
  card,
  anchorY,
}: {
  card: PlacedCardState;
  anchorY: number;
}) {
  const imagePath = card.card.imagePath;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="fixed right-[316px] z-[170000000] hidden w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md lg:block"
      style={{ top: Math.max(16, anchorY - 110) }}
    >
      <div className="relative aspect-[2.5/3.5] w-full bg-[#121212]">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={card.card.name}
            fill
            sizes="220px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm font-semibold text-[#a9b9df]">
            {card.card.name}
          </div>
        )}
        {card.isFoil && (
          <div className="absolute inset-0 foil-overlay pointer-events-none opacity-60" />
        )}
      </div>
    </motion.div>
  );
}

function CardDialog({
  card,
  open,
  onOpenChange,
}: {
  card: PlacedCardState | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!card) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="z-[200000000] max-w-[min(92vw,460px)] overflow-hidden border-white/10 bg-[#121212] p-0 shadow-[0_0_80px_rgba(0,0,0,0.45)]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{card.card.name}</DialogTitle>
          <DialogDescription>Visualizacao ampliada da carta.</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-3xl bg-[#121212]">
          {card.card.imagePath ? (
            <Image
              src={card.card.imagePath}
              alt={card.card.name}
              fill
              priority
              sizes="460px"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-xl font-semibold text-[#a9b9df]">
              {card.card.name}
            </div>
          )}
          {card.isFoil && (
            <div className="absolute inset-0 foil-overlay pointer-events-none opacity-60" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
