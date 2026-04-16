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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortMode = "cmc" | "rarity" | "name" | "type";

const SORT_MODES: { mode: SortMode; label: string }[] = [
  { mode: "cmc", label: "Mana" },
  { mode: "rarity", label: "Raridade" },
  { mode: "type", label: "Tipo" },
  { mode: "name", label: "Nome" },
];

function getTypeOrder(typeLine: string): number {
  if (typeLine.includes("Creature")) return 0;
  if (typeLine.includes("Planeswalker")) return 1;
  if (typeLine.includes("Artifact")) return 2;
  if (typeLine.includes("Enchantment")) return 3;
  if (typeLine.includes("Instant")) return 4;
  if (typeLine.includes("Sorcery")) return 5;
  if (typeLine.includes("Land")) return 9;
  return 6;
}

function sortCards(cards: PlacedCardState[], mode: SortMode = "cmc") {
  return [...cards].sort((a, b) => {
    switch (mode) {
      case "cmc":
        return (
          a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name)
        );
      case "rarity":
        return (
          (RARITY_ORDER[a.card.rarity] ?? 4) -
            (RARITY_ORDER[b.card.rarity] ?? 4) ||
          a.card.cmc - b.card.cmc ||
          a.card.name.localeCompare(b.card.name)
        );
      case "type":
        return (
          getTypeOrder(a.card.typeLine) - getTypeOrder(b.card.typeLine) ||
          a.card.cmc - b.card.cmc ||
          a.card.name.localeCompare(b.card.name)
        );
      case "name":
        return a.card.name.localeCompare(b.card.name);
      default:
        return 0;
    }
  });
}

const COLOR_ORDER = ["W", "U", "B", "R", "G"] as const;
type ManaColor = (typeof COLOR_ORDER)[number];

const COLOR_TEXT: Record<ManaColor, string> = {
  W: "text-[#f5e9c4]",
  U: "text-[#7ab0e0]",
  B: "text-[#b09fc0]",
  R: "text-[#e87060]",
  G: "text-[#60b878]",
};

function getColorCounts(cards: PlacedCardState[]): Record<ManaColor, number> {
  const counts: Record<ManaColor, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  for (const c of cards) {
    for (const color of c.card.colors as string[]) {
      const key = color.toUpperCase() as ManaColor;
      if (key in counts) counts[key]++;
    }
  }
  return counts;
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
  const [mainDeckSort, setMainDeckSort] = useState<SortMode>("cmc");

  const mainDeck = sortCards(
    cards.filter((c) => c.isMainDeck === true),
    mainDeckSort,
  );
  const sideboard = sortCards(cards.filter((c) => c.isMainDeck === false));
  const groupedMainDeck = groupDeckCards(mainDeck);
  const groupedSideboard = groupDeckCards(sideboard);
  const creatureCount = mainDeck.filter((c) =>
    c.card.typeLine.includes("Creature"),
  ).length;
  const colorCounts = getColorCounts(mainDeck);
  const recommendedLands = recommendBasicLands(
    cards.filter((c) => c.isMainDeck === true),
  );
  const currentLands = currentBasicLandCounts(mainDeck);
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
  const [draggingFromDeck, setDraggingFromDeck] = useState(false);

  // Called by CardRow when a deck-list card starts/ends dragging.
  // Mirrors the state into the shared context so the sidebar switches to
  // drop-zone mode and shows the "Remover do deck" target.
  const handleDeckCardDragState = useCallback(
    (id: string | null) => {
      setDraggingSidebarCardId(id);
      setDraggingFromDeck(id !== null);
      setDraggingCard(id);
    },
    [setDraggingCard],
  );

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

        {draggingFromDeck && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[#31456f]/70 to-transparent flex-shrink-0" />
            <DropZonePanel
              dataZone="remove"
              label="Remover do deck"
              colorClass="data-[active=true]:bg-red-500/15 data-[active=true]:border-red-400/60"
              icon="↩"
              onDropCard={(ids) => {
                setDeckZone(ids, null);
                setDraggingCard(null);
              }}
            />
          </>
        )}

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
              <CardHeader className="border-b border-[#30476f]/30 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#7f95c9]">
                      Resumo do Deck
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-[11px] text-white/28">
                      Main deck
                    </CardDescription>
                  </div>
                  {/* Total counter */}
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[22px] font-black leading-none tabular-nums text-[#d8e4ff]">
                      {mainDeck.length}
                    </span>
                    <span className="font-mono text-[9px] text-white/30">
                      /40
                    </span>
                  </div>
                </div>

                {/* Color breakdown */}
                <div className="mt-3 flex items-center justify-between">
                  {COLOR_ORDER.map((color) => (
                    <div
                      key={color}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="relative h-4 w-4 flex-shrink-0">
                        <Image
                          src={MANA_ICON_SRC[color]}
                          alt={color}
                          fill
                          className="object-contain opacity-85"
                        />
                      </span>
                      <span
                        className={`font-mono text-[18px] font-black tabular-nums leading-none ${COLOR_TEXT[color]}`}
                      >
                        {colorCounts[color]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-1 pt-3">
                <SummaryMetricRow label="Sideboard" value={sideboard.length} />
                <Separator className="bg-[#30476f]/25" />
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
                      recommendedMin={entry.min}
                      recommendedMax={entry.max}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-end gap-1.5">
                  <span className="h-px w-3 bg-[#f0d24b] shadow-[0_0_8px_rgba(240,210,75,0.45)]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/24">
                    Faixa recomendada de criaturas
                  </span>
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
                    <Image
                      key={c}
                      src={`/${c}.svg`}
                      alt={c}
                      width={12}
                      height={12}
                      className="opacity-70"
                      unoptimized
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
              headerExtra={
                <div className="flex items-center gap-1">
                  {SORT_MODES.map(({ mode, label }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setMainDeckSort(mode)}
                      className={`rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${
                        mainDeckSort === mode
                          ? "bg-[#31456f]/70 text-[#b8c6e6]"
                          : "text-white/30 hover:text-white/55"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
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
                      onDragStateChange={handleDeckCardDragState}
                      onRemove={(ids) => setDeckZone(ids, null)}
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
                      onDragStateChange={handleDeckCardDragState}
                      onRemove={(ids) => setDeckZone(ids, null)}
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

      <BasicLandsDialog
        open={isBasicLandsOpen}
        onOpenChange={setIsBasicLandsOpen}
        recommendedLands={recommendedLands}
        currentLands={currentLands}
        onAdd={async (landName, quantity) => {
          await addBasicLandsToKit(landName, quantity);
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
  count?: number;
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
          {count !== undefined && (
            <p className="text-white/30 text-xs mt-0.5">
              {count} carta{count !== 1 ? "s" : ""}
            </p>
          )}
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
  extra?: React.ReactNode;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader(
    { label, count, dataZone, isActive = false, extra },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-zone={dataZone}
        data-active="false"
        className={`sticky top-0 z-10 rounded-t-[22px] border-b px-3.5 backdrop-blur-md transition-colors ${
          isActive
            ? "border-[#4d6393]/35 bg-[#1a2433]/95"
            : "border-[#30476f]/30 bg-[#10151b]/95"
        }`}
      >
        <div className="flex items-center justify-between py-2">
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
        {extra && <div className="pb-2">{extra}</div>}
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
  onRemove,
}: {
  card: PlacedCardState;
  count?: number;
  dragIds: string[];
  isDragging?: boolean;
  onHover?: (card: PlacedCardState, anchorY: number) => void;
  onHoverEnd?: () => void;
  onOpen?: (card: PlacedCardState) => void;
  onDragStateChange?: (id: string | null) => void;
  onRemove?: (ids: string[]) => void;
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
            {onRemove && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(dragIds);
                }}
                className="ml-0.5 flex h-4 w-4 items-center justify-center rounded text-white/0 transition group-hover:text-white/35 hover:!text-white/80"
                title="Remover do deck"
              >
                ×
              </button>
            )}
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
        className={`font-mono text-[9px] uppercase tracking-[0.1em] ${accent ? "text-[#8ea4d6]" : "text-white/34"}`}
      >
        {label}
      </p>
      <p
        className={`font-mono text-[12px] font-semibold tabular-nums ${accent ? "text-[#d8e4ff]" : "text-white/72"}`}
      >
        {value}
      </p>
    </div>
  );
}

function BasicLandRow({
  name: _name,
  label,
  symbol,
  disabled,
  recommended,
  current,
  onAdd,
}: {
  name: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest";
  label: string;
  symbol: "W" | "U" | "B" | "R" | "G";
  disabled: boolean;
  recommended: number;
  current: number;
  onAdd: (quantity: number) => void;
}) {
  const defaultQty = Math.max(1, recommended - current);
  const [qty, setQty] = useState(defaultQty);

  // Update qty if recommendation changes
  const prevRecommended = useRef(recommended);
  const prevCurrent = useRef(current);
  useEffect(() => {
    if (
      prevRecommended.current !== recommended ||
      prevCurrent.current !== current
    ) {
      prevRecommended.current = recommended;
      prevCurrent.current = current;
      setQty(Math.max(1, recommended - current));
    }
  }, [recommended, current]);

  const diff = recommended - current;
  const diffLabel = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "✓";
  const diffColor =
    diff > 0
      ? "text-[#7ab0e0]"
      : diff < 0
        ? "text-[#e87060]"
        : "text-[#60b878]";

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#14191f] px-2.5 py-2 shadow-[0_0_0_1px_rgba(49,69,111,0.22)]">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-1.5 pl-5">
          <span className="font-mono text-[9px] text-white/30">
            atual <span className="text-white/55">{current}</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="font-mono text-[9px] text-white/30">
            ideal <span className="text-white/55">{recommended}</span>
          </span>
          <span className={`font-mono text-[9px] font-bold ${diffColor}`}>
            {diffLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center rounded-lg border border-[#30476f]/45 bg-[#0e1318]">
          <button
            type="button"
            disabled={disabled || qty <= 1}
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            className="flex h-6 w-5 items-center justify-center font-mono text-[11px] text-[#8ea4d6] transition-colors hover:text-[#b8c6e6] disabled:opacity-30"
            aria-label="Diminuir"
          >
            −
          </button>
          <Input
            type="number"
            min={1}
            max={20}
            value={qty}
            disabled={disabled}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd(qty);
            }}
            className="h-6 w-8 border-0 bg-transparent px-0 text-center font-mono text-[10px] text-[#b7c5e8] shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label={`Quantidade de ${label}`}
          />
          <button
            type="button"
            disabled={disabled || qty >= 20}
            onClick={() => setQty((v) => Math.min(20, v + 1))}
            className="flex h-6 w-5 items-center justify-center font-mono text-[11px] text-[#8ea4d6] transition-colors hover:text-[#b8c6e6] disabled:opacity-30"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={() => onAdd(qty)}
          className="rounded-lg border-[#30476f]/45 bg-[#162032] font-mono text-[9px] font-semibold text-[#b7c5e8] hover:bg-[#1c2941]"
          aria-label={`Adicionar ${qty} ${label} no deck`}
        >
          Adicionar no deck
        </Button>
      </div>
    </div>
  );
}

function BasicLandsDialog({
  open,
  onOpenChange,
  recommendedLands,
  currentLands,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendedLands: Record<string, number>;
  currentLands: Record<string, number>;
  onAdd: (
    landName: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest",
    quantity: number,
  ) => Promise<void>;
}) {
  const [loadingLand, setLoadingLand] = useState<string | null>(null);

  const handleAdd = async (
    landName: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest",
    quantity: number,
  ) => {
    setLoadingLand(landName);
    try {
      await onAdd(landName, quantity);
    } finally {
      setLoadingLand(null);
    }
  };

  const COLOR_FOR_LAND: Record<string, string> = {
    Plains: "W",
    Island: "U",
    Swamp: "B",
    Mountain: "R",
    Forest: "G",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[210000000] max-w-[420px] border-[#30476f]/40 bg-[#101317] text-white">
        <DialogHeader>
          <DialogTitle className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#7f95c9]">
            Terrenos Básicos
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] text-white/34">
            Recomendação baseada nos pips de mana do deck (17 terrenos limited)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          {BASIC_LANDS.map((land) => {
            const col = COLOR_FOR_LAND[land.name] ?? "W";
            return (
              <BasicLandRow
                key={land.name}
                name={land.name}
                label={land.label}
                symbol={land.symbol}
                disabled={loadingLand === land.name}
                recommended={recommendedLands[col] ?? 0}
                current={currentLands[col] ?? 0}
                onAdd={(quantity) => void handleAdd(land.name, quantity)}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
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
    headerExtra?: React.ReactNode;
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
    headerExtra,
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
        extra={headerExtra}
      />
      {children}
    </section>
  );
});

function ManaCurveBar({
  label,
  value,
  max,
  recommendedMin,
  recommendedMax,
}: {
  label: string;
  value: number;
  max: number;
  recommendedMin: number;
  recommendedMax: number;
}) {
  const height = max > 0 ? Math.max(4, (value / max) * 48) : 4;
  const hasRecommendation = recommendedMax > 0;
  const recommendedLineOffset =
    max > 0 && recommendedMax > 0 ? (recommendedMax / max) * 48 : 0;
  const recommendedLabel = `${recommendedMin}-${recommendedMax}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[9px] text-white/32">{value}</span>
      <div className="relative flex h-12 w-full items-end rounded-full bg-white/[0.03] px-[2px] pb-[2px]">
        {hasRecommendation && (
          <div
            className="pointer-events-none absolute inset-x-[1px] border-t border-[#f0d24b] shadow-[0_0_8px_rgba(240,210,75,0.45)]"
            style={{
              bottom: `${2 + recommendedLineOffset}px`,
            }}
          />
        )}
        <div
          className="relative w-full rounded-full bg-[#4d6393]/85"
          style={{ height }}
        />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/24">
        {label}
      </span>
      <span className="font-mono text-[9px] tracking-[0.04em] text-[#f0d24b]">
        ({recommendedLabel})
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
  // Generic
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
  X: "/X.svg",
  // Basic colors
  W: "/W.svg",
  U: "/U.svg",
  B: "/B.svg",
  R: "/R.svg",
  G: "/G.svg",
  C: "/C.svg",
  // Hybrid — token format inside {}: e.g. {W/U} → token "W/U"
  "W/U": "/WU.svg",
  "W/B": "/WB.svg",
  "U/B": "/UB.svg",
  "U/R": "/UR.svg",
  "B/R": "/BR.svg",
  "B/G": "/BG.svg",
  "R/G": "/RG.svg",
  "R/W": "/RW.svg",
  "G/W": "/GW.svg",
  "G/U": "/GU.svg",
  // 2/color hybrid — e.g. {2/W}
  "2/W": "/2W.svg",
  "2/U": "/2U.svg",
  "2/B": "/2B.svg",
  "2/R": "/2R.svg",
  "2/G": "/2G.svg",
  // Phyrexian — e.g. {W/P}
  "W/P": "/WP.svg",
  "U/P": "/UP.svg",
  "B/P": "/BP.svg",
  "R/P": "/RP.svg",
  "G/P": "/GP.svg",
  // Hybrid phyrexian — e.g. {W/U/P}
  "W/U/P": "/WUP.svg",
  "W/B/P": "/WBP.svg",
  "U/B/P": "/UBP.svg",
  "U/R/P": "/URP.svg",
  "B/R/P": "/BRP.svg",
  "B/G/P": "/BGP.svg",
  "R/G/P": "/RGP.svg",
  "R/W/P": "/RWP.svg",
  "G/W/P": "/GWP.svg",
  "G/U/P": "/GUP.svg",
  // Colorless hybrid — e.g. {C/W}
  "C/W": "/CW.svg",
  "C/U": "/CU.svg",
  "C/B": "/CB.svg",
  "C/R": "/CR.svg",
  "C/G": "/CG.svg",
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

// ─── Basic land recommendation ─────────────────────────────────────────────────

const BASIC_COLORS = ["W", "U", "B", "R", "G"] as const;
const BASIC_LAND_NAME: Record<string, string> = {
  W: "Plains",
  U: "Island",
  B: "Swamp",
  R: "Mountain",
  G: "Forest",
};

/**
 * Count colored mana pips per color in non-land cards.
 * Hybrid pips like {W/U} count as 0.5 for each color.
 */
function countManaPips(cards: PlacedCardState[]): Record<string, number> {
  const counts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  for (const c of cards) {
    if (c.card.typeLine.includes("Land")) continue;
    for (const token of parseManaCost(c.card.manaCost)) {
      if (token.includes("/")) {
        // Hybrid pip: split 0.5 to each color
        for (const part of token.split("/")) {
          if (part in counts) counts[part] += 0.5;
        }
      } else if (token in counts) {
        counts[token]++;
      }
    }
  }
  return counts;
}

/**
 * Recommend how many basic lands of each color for a limited deck.
 * Uses pip-proportional distribution with largest-remainder rounding.
 * landBudget = total lands the deck should have (default 17 for limited).
 */
function recommendBasicLands(
  cards: PlacedCardState[],
  landBudget = 17,
): Record<string, number> {
  const pips = countManaPips(cards);
  const totalPips = Object.values(pips).reduce((a, b) => a + b, 0);
  const result: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  if (totalPips === 0) return result;

  // Count non-basic lands already in deck (they don't need to be basic)
  const nonBasicLandCount = cards.filter(
    (c) =>
      c.card.typeLine.includes("Land") &&
      !BASIC_COLORS.some((col) => c.card.name === BASIC_LAND_NAME[col]),
  ).length;
  const budget = Math.max(0, landBudget - nonBasicLandCount);

  // Proportional share per color (only colors with pips)
  const usedColors = BASIC_COLORS.filter((col) => pips[col] > 0);
  const raw: Record<string, number> = {};
  for (const col of usedColors) {
    raw[col] = (pips[col] / totalPips) * budget;
  }

  // Floor all, then add 1 to colors with largest fractional remainder
  for (const col of usedColors) result[col] = Math.floor(raw[col]);
  const remaining = budget - usedColors.reduce((s, col) => s + result[col], 0);
  const byFrac = [...usedColors].sort((a, b) => (raw[b] % 1) - (raw[a] % 1));
  for (let i = 0; i < remaining && i < byFrac.length; i++) {
    result[byFrac[i]]++;
  }

  return result;
}

/**
 * Count current basic lands in main deck by name.
 */
function currentBasicLandCounts(
  cards: PlacedCardState[],
): Record<string, number> {
  const counts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  for (const c of cards) {
    for (const col of BASIC_COLORS) {
      if (c.card.name === BASIC_LAND_NAME[col]) counts[col]++;
    }
  }
  return counts;
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
  const recommendedCurve = {
    "0": { min: 0, max: 0 },
    "1": { min: 0, max: 2 },
    "2": { min: 4, max: 6 },
    "3": { min: 3, max: 5 },
    "4": { min: 2, max: 4 },
    "5": { min: 1, max: 3 },
    "6+": { min: 0, max: 2 },
  } as const;

  const buckets = [
    { label: "0", value: 0, ...recommendedCurve["0"] },
    { label: "1", value: 0, ...recommendedCurve["1"] },
    { label: "2", value: 0, ...recommendedCurve["2"] },
    { label: "3", value: 0, ...recommendedCurve["3"] },
    { label: "4", value: 0, ...recommendedCurve["4"] },
    { label: "5", value: 0, ...recommendedCurve["5"] },
    { label: "6+", value: 0, ...recommendedCurve["6+"] },
  ];

  for (const card of cards) {
    if (card.card.typeLine.includes("Land")) continue;
    const bucketIndex = Math.min(card.card.cmc, 6);
    buckets[bucketIndex].value += 1;
  }

  const maxValue = Math.max(
    0,
    ...buckets.map((bucket) => Math.max(bucket.value, bucket.max)),
  );
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
