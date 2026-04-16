"use client";

import { DndContext } from "@dnd-kit/core";
import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { GameSettingsMenu } from "@/components/GameSettingsMenu";
import { Button } from "@/components/ui/button";
import { CardBack } from "@/features/playtest/components/CardBack";
import { Playmat } from "@/features/playtest/components/Playmat";
import { BattlefieldArea } from "@/features/playtest/components/playmat/BattlefieldArea";
import { BattlefieldArrowOverlay } from "@/features/playtest/components/playmat/BattlefieldArrowOverlay";
import {
  BATTLEFIELD_ZOOM_MIN,
  BATTLEFIELD_ZOOM_STEP,
} from "@/features/playtest/components/playmat/constants";
import { OpponentHandZone } from "@/features/playtest/components/playmat/OpponentHandZone";
import { OpponentSidePanel } from "@/features/playtest/components/playmat/OpponentSidePanel";
import { PreviewOverlay } from "@/features/playtest/components/playmat/PreviewOverlay";
import type {
  CardHoverInfo,
  PreviewAnchor,
} from "@/features/playtest/components/playmat/types";
import {
  type ZonePreviewCard,
  ZonePreviewModal,
} from "@/features/playtest/components/playmat/ZonePreviewModal";
import type { GameContextValue } from "@/features/playtest/store/GameProvider";
import { GameContext } from "@/features/playtest/store/GameProvider";
import {
  selectAllCardsByZone,
  selectCardWithDefinition,
} from "@/lib/game/selectors";
import { getGameSetup, hasPlayerKeptOpeningHand } from "@/lib/game/setup";
import type { CardInstance } from "@/lib/game/types";
import { useMultiplayerGameContext } from "../store/MultiplayerGameProvider";

type MultiplayerPlaymatProps = {
  myRole: "host" | "guest";
  hostName: string;
  guestName: string;
};

type OpponentZonePreview = "graveyard" | "exile" | null;

type OpponentStackInfo = {
  topName: string;
  topImageUrl: string | null;
};

type OpponentBattlefieldCard = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  cardType: string;
  power: string | null;
  toughness: string | null;
};

export function MultiplayerPlaymat({
  myRole: _myRole,
  hostName,
  guestName,
}: MultiplayerPlaymatProps) {
  const multiCtx = useMultiplayerGameContext();
  const localPlayer = multiCtx.state.players[multiCtx.localPlayerId];
  const setup = getGameSetup(multiCtx.state);
  const mulliganState = setup.mulligan;
  const hasKeptOpeningHand = hasPlayerKeptOpeningHand(
    multiCtx.state,
    multiCtx.localPlayerId,
  );
  const opponentHasKeptOpeningHand = hasPlayerKeptOpeningHand(
    multiCtx.state,
    multiCtx.opponentPlayerId,
  );

  const shouldOpenOpeningHand =
    Boolean(localPlayer) &&
    mulliganState.stage === "mulligan" &&
    !hasKeptOpeningHand &&
    localPlayer.zones.hand.length === 0 &&
    localPlayer.zones.library.length > 0;

  // ── Mulligan ──────────────────────────────────────────────────────────────
  const [isOpeningHandOpen, setIsOpeningHandOpen] = useState(
    shouldOpenOpeningHand,
  );
  const didPrepareRef = useRef(false);
  const [isOpeningHandPending, setIsOpeningHandPending] = useState(false);

  // Reopen mulligan only when the underlying game instance changes.
  const prevGameIdRef = useRef(multiCtx.state.id);
  useEffect(() => {
    if (multiCtx.state.id === prevGameIdRef.current) return;
    prevGameIdRef.current = multiCtx.state.id;
    didPrepareRef.current = false;
    setIsOpeningHandPending(false);
    setIsOpeningHandOpen(shouldOpenOpeningHand);
  }, [multiCtx.state.id, shouldOpenOpeningHand]);

  const drawOpeningHand = useCallback(async () => {
    setIsOpeningHandPending(true);
    try {
      await fetch(`/api/game/${multiCtx.roomId}/opening-hand`, {
        method: "POST",
      });
    } finally {
      setIsOpeningHandPending(false);
    }
  }, [multiCtx.roomId]);

  useEffect(() => {
    if (!isOpeningHandOpen && shouldOpenOpeningHand) {
      setIsOpeningHandOpen(true);
    }
  }, [isOpeningHandOpen, shouldOpenOpeningHand]);

  // Trigger opening hand draw when library is full and hand is empty
  useEffect(() => {
    if (didPrepareRef.current || !isOpeningHandOpen || isOpeningHandPending)
      return;
    if (!localPlayer) return;
    if (!shouldOpenOpeningHand) return;
    didPrepareRef.current = true;
    void drawOpeningHand();
  }, [
    drawOpeningHand,
    isOpeningHandOpen,
    isOpeningHandPending,
    localPlayer,
    shouldOpenOpeningHand,
  ]);

  const handleMulligan = useCallback(async () => {
    if (!localPlayer || isOpeningHandPending) return;

    setIsOpeningHandPending(true);
    try {
      await fetch(`/api/game/${multiCtx.roomId}/mulligan`, {
        method: "POST",
      });
    } finally {
      setIsOpeningHandPending(false);
    }
  }, [isOpeningHandPending, localPlayer, multiCtx.roomId]);

  const handleKeepHand = useCallback(() => {
    setIsOpeningHandOpen(false);
    void multiCtx.keepOpeningHand();
  }, [multiCtx]);

  useEffect(() => {
    if ((localPlayer?.zones.hand.length ?? 0) > 0) {
      setIsOpeningHandPending(false);
    }
  }, [localPlayer?.zones.hand.length]);

  const openingHandCards = (localPlayer?.zones.hand ?? [])
    .map((cardId) => {
      const instance = multiCtx.state.cardInstances[cardId];
      if (!instance) return null;
      const definition = multiCtx.state.cardDefinitions[instance.definitionId];
      if (!definition) return null;
      return {
        id: cardId,
        name: definition.name,
        imageUrl: definition.imageUrl,
      };
    })
    .filter(
      (c): c is { id: string; name: string; imageUrl: string | null } =>
        c !== null,
    );

  const isPreparing =
    isOpeningHandOpen &&
    ((localPlayer?.zones.hand.length ?? 0) === 0 || isOpeningHandPending);
  const activePlayerName =
    multiCtx.state.players[multiCtx.state.activePlayerId]?.name ?? "";
  const isWaitingForOpponentKeep =
    mulliganState.stage === "mulligan" &&
    hasKeptOpeningHand &&
    !opponentHasKeptOpeningHand;
  const isRollingFirstPlayer = multiCtx.isFirstPlayerRollActive;
  const firstPlayerRollWinnerId = multiCtx.firstPlayerRollWinnerId;

  // Show "X vai primeiro!" for 2 s after the roll animation ends
  const [rollResultWinnerId, setRollResultWinnerId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (isRollingFirstPlayer || !firstPlayerRollWinnerId) return;
    setRollResultWinnerId(firstPlayerRollWinnerId);
    const t = window.setTimeout(() => setRollResultWinnerId(null), 2000);
    return () => window.clearTimeout(t);
  }, [isRollingFirstPlayer, firstPlayerRollWinnerId]);

  const [opponentBattlefieldZoom, setOpponentBattlefieldZoom] =
    useState(BATTLEFIELD_ZOOM_MIN);
  const [opponentBattlefieldPan, setOpponentBattlefieldPan] = useState({
    x: 0,
    y: 0,
  });
  const [opponentZonePreview, setOpponentZonePreview] =
    useState<OpponentZonePreview>(null);
  const [opponentPreviewCard, setOpponentPreviewCard] =
    useState<CardHoverInfo | null>(null);
  const [opponentPreviewAnchor, setOpponentPreviewAnchor] =
    useState<PreviewAnchor | null>(null);
  const [mulliganPreviewCard, setMulliganPreviewCard] =
    useState<CardHoverInfo | null>(null);
  const [mulliganPreviewAnchor, setMulliganPreviewAnchor] =
    useState<PreviewAnchor | null>(null);

  const getNextOpponentZoom = useCallback((current: number, delta: number) => {
    const factor = 1 + Math.abs(delta);
    const next = delta >= 0 ? current * factor : current / factor;

    return Math.max(0.001, Math.min(next, 1000));
  }, []);

  const adjustOpponentZoom = useCallback(
    (delta: number) =>
      setOpponentBattlefieldZoom((current) =>
        getNextOpponentZoom(current, delta),
      ),
    [getNextOpponentZoom],
  );

  const showOpponentPreview = useCallback(
    (info: CardHoverInfo | null, target: HTMLElement | null) => {
      setOpponentPreviewCard(info);
      if (!target) {
        setOpponentPreviewAnchor(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      setOpponentPreviewAnchor({
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    },
    [],
  );

  const handleOpponentHover = useCallback(
    (
      _cardId: string,
      info: CardHoverInfo | null,
      target: HTMLElement | null,
    ) => {
      showOpponentPreview(info, target);
    },
    [showOpponentPreview],
  );

  const handleOpponentWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      adjustOpponentZoom(
        e.deltaY < 0 ? BATTLEFIELD_ZOOM_STEP : -BATTLEFIELD_ZOOM_STEP,
      );
    },
    [adjustOpponentZoom],
  );

  // Build a GameContext value that bridges multiplayer state → solo Playmat
  const gameCtxValue: GameContextValue = {
    state: multiCtx.state,
    dispatch: multiCtx.dispatch,
    undo: () => {},
    redo: () => {},
    reset: () => {},
    canUndo: false,
    canRedo: false,
    localPlayerId: multiCtx.localPlayerId,
    activePings: multiCtx.activePings,
  };

  const { state, opponentPlayerId } = multiCtx;
  const opponentZones = selectAllCardsByZone(state, opponentPlayerId);
  const opponentPlayer = state.players[opponentPlayerId] ?? null;

  const opponentBattlefieldCards: OpponentBattlefieldCard[] =
    opponentZones.battlefield.map((card) => {
      const selected = selectCardWithDefinition(state, card.id);
      const definitionType = selected?.definition.type ?? "";
      const cardType = card.tokenData?.type ?? definitionType;
      const power = selected?.definition.power ?? card.tokenData?.power ?? null;
      const toughness =
        selected?.definition.toughness ?? card.tokenData?.toughness ?? null;

      return {
        card,
        name: selected?.definition.name ?? "carta",
        imageUrl: card.faceDown
          ? null
          : (selected?.definition.imageUrl ?? null),
        manaCost: selected?.definition.manaCost ?? "",
        cardType,
        power,
        toughness,
      };
    });
  // Mirror the opponent's arrow Y coordinates: the opponent drew them relative to
  // their own screen (battlefield at the bottom), but we display their battlefield
  // at the top of our screen, so Y must be flipped (y' = 1 - y).
  const opponentBattlefieldArrows = (state.battlefieldArrows ?? [])
    .filter((arrow) => arrow.playerId === opponentPlayerId)
    .map((arrow) => ({
      ...arrow,
      start: { x: arrow.start.x, y: 1 - arrow.start.y },
      end: { x: arrow.end.x, y: 1 - arrow.end.y },
    }));

  const opponentGraveyardTop = opponentZones.graveyard.at(-1);
  const opponentExileTop = opponentZones.exile.at(-1);

  const emptyStackInfo: OpponentStackInfo = { topName: "", topImageUrl: null };

  const opponentGraveyardTopInfo: OpponentStackInfo = opponentGraveyardTop
    ? (() => {
        const sel = selectCardWithDefinition(state, opponentGraveyardTop.id);
        return {
          topName: sel?.definition.name ?? "Carta",
          topImageUrl: sel?.definition.imageUrl ?? null,
        };
      })()
    : emptyStackInfo;

  const opponentExileTopInfo: OpponentStackInfo = opponentExileTop
    ? (() => {
        const sel = selectCardWithDefinition(state, opponentExileTop.id);
        return {
          topName: sel?.definition.name ?? "Carta",
          topImageUrl: sel?.definition.imageUrl ?? null,
        };
      })()
    : emptyStackInfo;

  const opponentGraveyardPreviewCards: ZonePreviewCard[] =
    opponentZones.graveyard.map((card) => {
      const sel = selectCardWithDefinition(state, card.id);
      return {
        id: card.id,
        name:
          card.customName ??
          card.tokenData?.name ??
          sel?.definition.name ??
          "Carta",
        imageUrl: card.tokenData?.imageUrl ?? sel?.definition.imageUrl ?? null,
      };
    });

  const opponentExilePreviewCards: ZonePreviewCard[] = opponentZones.exile.map(
    (card) => {
      const sel = selectCardWithDefinition(state, card.id);
      return {
        id: card.id,
        name:
          card.customName ??
          card.tokenData?.name ??
          sel?.definition.name ??
          "Carta",
        imageUrl: card.tokenData?.imageUrl ?? sel?.definition.imageUrl ?? null,
      };
    },
  );

  return (
    <GameContext.Provider value={gameCtxValue}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0b0e14]">
        <GameSettingsMenu
          onReset={multiCtx.requestReset}
          collectionHref="/decks"
          log={multiCtx.state.log}
          multiplayerReset={{
            open: multiCtx.hostResetAccepted || multiCtx.guestResetAccepted,
            currentPlayerAccepted:
              multiCtx.myRole === "host"
                ? multiCtx.hostResetAccepted
                : multiCtx.guestResetAccepted,
            opponentAccepted:
              multiCtx.myRole === "host"
                ? multiCtx.guestResetAccepted
                : multiCtx.hostResetAccepted,
            currentPlayerLabel:
              multiCtx.myRole === "host" ? hostName : guestName,
            opponentLabel: multiCtx.myRole === "host" ? guestName : hostName,
            pending: multiCtx.isResetPending,
            onCancel: multiCtx.cancelReset,
          }}
        />

        {/* Connection indicator */}
        {!multiCtx.isConnected && (
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[600] flex justify-center">
            <div className="flex items-center gap-2 rounded-b-xl border-x border-b border-amber-400/30 bg-amber-950/90 px-5 py-2 shadow-[0_4px_24px_rgba(251,191,36,0.18)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                Reconectando...
              </span>
            </div>
          </div>
        )}

        {multiCtx.isConnected && multiCtx.isActionPending && (
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[590] flex justify-center">
            <div className="flex items-center gap-2 rounded-b-xl border-x border-b border-sky-500/25 bg-sky-950/85 px-5 py-2 shadow-[0_4px_16px_rgba(14,165,233,0.12)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200">
                Sincronizando jogada...
              </span>
            </div>
          </div>
        )}

        {multiCtx.mulliganToastMessage && (
          <div className="pointer-events-none fixed inset-x-0 top-5 z-[640] flex justify-center px-4">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-400/25 bg-indigo-950/88 px-5 py-2.5 shadow-[0_8px_32px_rgba(99,102,241,0.22)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="text-[13px] font-semibold text-indigo-100">
                {multiCtx.mulliganToastMessage}
              </span>
            </div>
          </div>
        )}

        {/* Opponent hand / zones row — 15% */}
        <div
          id="opponent-zones-row"
          className="flex flex-row items-center gap-4 overflow-hidden px-3"
          style={{ height: "15vh" }}
        >
          <OpponentSidePanel
            graveyard={{
              ...opponentGraveyardTopInfo,
              count: opponentZones.graveyard.length,
            }}
            exile={{
              ...opponentExileTopInfo,
              count: opponentZones.exile.length,
            }}
            libraryCount={opponentZones.library.length}
            onViewGraveyard={() => setOpponentZonePreview("graveyard")}
            onViewExile={() => setOpponentZonePreview("exile")}
            onHoverGraveyardTop={showOpponentPreview}
            onHoverExileTop={showOpponentPreview}
          />
          <OpponentHandZone count={opponentZones.hand.length} />
        </div>

        {/* Opponent battlefield — 35% */}
        <div
          id="opponent-battlefield"
          className="overflow-hidden pt-2"
          style={{ height: "35vh" }}
        >
          <BattlefieldArea
            isActiveDropTarget={false}
            isAnyDragActive={false}
            interactive={false}
            isActiveTurn={state.activePlayerId === opponentPlayerId}
            isRollingForFirstTurn={isRollingFirstPlayer}
            orientation="top"
            playerName={opponentPlayer?.name ?? "Oponente"}
            life={opponentPlayer?.life ?? 20}
            turnLabel={`Turno ${state.turnNumber}`}
            battlefieldZoom={opponentBattlefieldZoom}
            battlefieldCards={opponentBattlefieldCards}
            activePings={multiCtx.activePings}
            pan={opponentBattlefieldPan}
            onPan={setOpponentBattlefieldPan}
            onWheel={handleOpponentWheel}
            onAdjustZoom={adjustOpponentZoom}
            onHoverCard={handleOpponentHover}
          />
        </div>

        {/* Turn indicator divider */}
        <div className="relative h-0 overflow-visible">
          <div className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2">
            <TurnIndicator
              turnNumber={state.turnNumber}
              activePlayerName={activePlayerName}
              isMyTurn={state.activePlayerId === multiCtx.localPlayerId}
            />
          </div>
        </div>

        {/* Local player — 50% (Playmat handles 35% battlefield + 15% hand internally) */}
        <div className="relative overflow-hidden" style={{ height: "50vh" }}>
          <div className="relative h-full w-full">
            <Playmat
              playerName="Você"
              isRollingForFirstTurn={isRollingFirstPlayer}
              allowInfiniteBattlefieldZoom
            />
          </div>
        </div>

        <BattlefieldArrowOverlay arrows={opponentBattlefieldArrows} />
      </div>

      {/* Opponent zone preview modals — wrapped in its own DndContext so that
          useDndMonitor / useDraggable inside ZonePreviewModal work correctly
          even though this modal lives outside Playmat's DndContext. */}
      <DndContext>
        <ZonePreviewModal
          zone={opponentZonePreview}
          cards={
            opponentZonePreview === "graveyard"
              ? opponentGraveyardPreviewCards
              : opponentExilePreviewCards
          }
          onClose={() => setOpponentZonePreview(null)}
          onHoverCard={showOpponentPreview}
        />
      </DndContext>

      {/* Opponent battlefield card hover preview */}
      <PreviewOverlay
        previewCard={opponentPreviewCard}
        previewAnchor={opponentPreviewAnchor}
        preferBelow
      />

      {isWaitingForOpponentKeep && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[650] flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-950/85 px-5 py-2.5 shadow-[0_8px_32px_rgba(251,191,36,0.18)] backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-[13px] font-semibold text-amber-100">
              Aguardando oponente ficar com a mao...
            </span>
          </div>
        </div>
      )}

      {(isRollingFirstPlayer || rollResultWinnerId) && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[650] flex justify-center px-4">
          {isRollingFirstPlayer ? (
            <div className="flex items-center gap-3 rounded-2xl border border-violet-400/35 bg-violet-950/88 px-5 py-2.5 shadow-[0_8px_32px_rgba(167,139,250,0.25)] backdrop-blur-md">
              <span className="h-2 w-2 animate-ping rounded-full bg-violet-400" />
              <span className="text-[13px] font-semibold text-violet-100">
                Sorteando quem joga primeiro...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-violet-400/60 bg-violet-950/95 px-5 py-2.5 shadow-[0_8px_32px_rgba(167,139,250,0.35)] backdrop-blur-md">
              <span className="text-base">🎲</span>
              <span className="text-[13px] font-semibold text-violet-100">
                {rollResultWinnerId === multiCtx.localPlayerId
                  ? "Você vai primeiro!"
                  : `${multiCtx.state.players[rollResultWinnerId ?? ""]?.name ?? "Oponente"} vai primeiro!`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mulligan modal */}
      {isOpeningHandOpen &&
        mulliganState.stage === "mulligan" &&
        !hasKeptOpeningHand && (
          <div className="pointer-events-auto fixed inset-0 z-[700] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
            <div className="pointer-events-auto relative w-full max-w-6xl rounded-[1.75rem] border border-white/10 bg-[#0d1017] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-6">
              <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
                    Mao inicial
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                    Escolha sua mao de abertura
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    {isPreparing
                      ? "Preparando sua mao inicial..."
                      : `O grimorio ja foi embaralhado. Voce pode ficar com estas ${openingHandCards.length} cartas ou pedir mulligan.`}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
                {isPreparing
                  ? Array.from({ length: 7 }, (_, i) => i).map((i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="relative h-[167px] w-[120px] overflow-hidden rounded-[10px] border border-white/10 bg-black/20 shadow-lg sm:h-[209px] sm:w-[150px]">
                          <CardBack className="h-full w-full rounded-[10px] opacity-70" />
                        </div>
                        <span className="max-w-[120px] text-center text-[10px] text-white/30">
                          Carregando...
                        </span>
                      </div>
                    ))
                  : openingHandCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        className="flex flex-col items-center gap-2 bg-transparent p-0 text-inherit"
                        onMouseEnter={(event) => {
                          setMulliganPreviewCard({
                            name: card.name,
                            imageUrl: card.imageUrl,
                          });
                          const rect =
                            event.currentTarget.getBoundingClientRect();
                          setMulliganPreviewAnchor({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => {
                          setMulliganPreviewCard(null);
                          setMulliganPreviewAnchor(null);
                        }}
                      >
                        <div className="relative h-[167px] w-[120px] overflow-hidden rounded-[10px] border border-white/10 bg-black/20 shadow-lg sm:h-[209px] sm:w-[150px]">
                          {card.imageUrl ? (
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              width={150}
                              height={209}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <CardBack className="h-full w-full rounded-[10px]" />
                          )}
                        </div>
                        <span className="max-w-[120px] text-center text-[10px] text-white/55">
                          {card.name}
                        </span>
                      </button>
                    ))}
              </div>

              {isPreparing && (
                <div className="mt-4 flex items-center justify-center gap-3 text-sm text-white/55">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                  <span>Carregando mao inicial...</span>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]"
                  onClick={handleMulligan}
                  disabled={isPreparing}
                >
                  Mulligan
                </Button>
                <Button
                  type="button"
                  className="bg-[#4d6393] text-white hover:bg-[#5f77ab]"
                  onClick={handleKeepHand}
                  disabled={isPreparing}
                >
                  Ficar com a mao
                </Button>
              </div>
            </div>
            <PreviewOverlay
              previewCard={mulliganPreviewCard}
              previewAnchor={mulliganPreviewAnchor}
            />
          </div>
        )}
    </GameContext.Provider>
  );
}

// ─── Turn / Phase indicator ───────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  untap: "Desentortar",
  upkeep: "Manutenção",
  draw: "Compra",
  main1: "Principal 1",
  beginCombat: "Início do Combate",
  declareAttackers: "Declarar Atacantes",
  declareBlockers: "Declarar Bloqueadores",
  combatDamage: "Dano de Combate",
  endCombat: "Fim do Combate",
  main2: "Principal 2",
  end: "Fim",
  cleanup: "Limpeza",
};

function TurnIndicator({
  turnNumber,
  activePlayerName,
  isMyTurn,
}: {
  turnNumber: number;
  activePlayerName: string;
  isMyTurn: boolean;
}) {
  const accentColor = isMyTurn ? "#7fb08f" : "#9aa8c4";
  const borderColor = isMyTurn ? "rgba(127,176,143,0.35)" : "rgba(154,168,196,0.2)";
  const glowColor = isMyTurn
    ? "0 0 18px rgba(127,176,143,0.18)"
    : "0 2px 12px rgba(0,0,0,0.4)";

  return (
    <div
      className="flex items-center gap-2.5 rounded-full px-3.5 py-1.5 backdrop-blur-md"
      style={{
        border: `1px solid ${borderColor}`,
        background: "rgba(10,13,20,0.82)",
        boxShadow: glowColor,
      }}
    >
      <span
        className="font-mono text-[9px] font-bold uppercase leading-none tracking-[0.22em]"
        style={{ color: accentColor }}
      >
        T{turnNumber}
      </span>

      {activePlayerName && (
        <span className="text-[11px] font-semibold leading-none text-white/80">
          {activePlayerName}
        </span>
      )}

      {/* Arrow: up = opponent's turn, down = my turn */}
      {isMyTurn
        ? <ArrowDown size={14} style={{ color: accentColor }} />
        : <ArrowUp size={14} style={{ color: accentColor }} />
      }
    </div>
  );
}

