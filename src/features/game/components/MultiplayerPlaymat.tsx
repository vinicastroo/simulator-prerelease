"use client";

import { useCallback, useState, type WheelEvent } from "react";
import { Playmat } from "@/features/playtest/components/Playmat";
import { BattlefieldArea } from "@/features/playtest/components/playmat/BattlefieldArea";
import {
  BATTLEFIELD_ZOOM_MAX,
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
import type { CardInstance } from "@/lib/game/types";
import { useMultiplayerGameContext } from "../store/MultiplayerGameProvider";

type MultiplayerPlaymatProps = {
  myRole: "host" | "guest";
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
}: MultiplayerPlaymatProps) {
  const multiCtx = useMultiplayerGameContext();

  const [opponentBattlefieldZoom, setOpponentBattlefieldZoom] = useState(1);
  const [opponentZonePreview, setOpponentZonePreview] =
    useState<OpponentZonePreview>(null);
  const [opponentPreviewCard, setOpponentPreviewCard] =
    useState<CardHoverInfo | null>(null);
  const [opponentPreviewAnchor, setOpponentPreviewAnchor] =
    useState<PreviewAnchor | null>(null);

  const clampZoom = useCallback(
    (v: number) =>
      Math.max(BATTLEFIELD_ZOOM_MIN, Math.min(v, BATTLEFIELD_ZOOM_MAX)),
    [],
  );

  const adjustOpponentZoom = useCallback(
    (delta: number) => setOpponentBattlefieldZoom((p) => clampZoom(p + delta)),
    [clampZoom],
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
      const power = card.tokenData?.power ?? selected?.definition.power ?? null;
      const toughness =
        card.tokenData?.toughness ?? selected?.definition.toughness ?? null;

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
        {/* Connection indicator */}
        {!multiCtx.isConnected && (
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[600] flex justify-center">
            <div className="rounded-b-lg bg-yellow-900/80 px-4 py-1 text-xs font-semibold text-yellow-200">
              Reconectando...
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
            orientation="top"
            playerName={opponentPlayer?.name ?? "Oponente"}
            life={opponentPlayer?.life ?? 20}
            turnLabel={`Turno ${state.turnNumber}`}
            battlefieldZoom={opponentBattlefieldZoom}
            battlefieldCards={opponentBattlefieldCards}
            activePings={multiCtx.activePings}
            onWheel={handleOpponentWheel}
            onAdjustZoom={adjustOpponentZoom}
            onHoverCard={handleOpponentHover}
          />
        </div>

        {/* Turn indicator divider */}
        <div className="relative h-0 overflow-visible">
          <div className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full border border-white/15 bg-black/60 px-4 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                Turno {state.turnNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Local player — 50% (Playmat handles 35% battlefield + 15% hand internally) */}
        <div className="relative overflow-hidden" style={{ height: "50vh" }}>
          <div className="relative h-full w-full">
            <Playmat playerName="Você" />
          </div>
        </div>
      </div>

      {/* Opponent zone preview modals */}
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

      {/* Opponent battlefield card hover preview */}
      <PreviewOverlay
        previewCard={opponentPreviewCard}
        previewAnchor={opponentPreviewAnchor}
        preferBelow
      />
    </GameContext.Provider>
  );
}
