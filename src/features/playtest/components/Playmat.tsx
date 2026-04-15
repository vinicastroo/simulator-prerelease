"use client";

import {
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { selectCardWithDefinition } from "@/lib/game/selectors";
import { shuffleCardIds } from "@/lib/game/shuffle";
import type { CardInstance, TurnPhase } from "@/lib/game/types";
import { useGameStore } from "../hooks/useGameStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { CardBack } from "./CardBack";
import { BattlefieldArea } from "./playmat/BattlefieldArea";
import {
  BATTLEFIELD_CARD_HEIGHT,
  BATTLEFIELD_CARD_WIDTH,
  BATTLEFIELD_ZOOM_MAX,
  BATTLEFIELD_ZOOM_MIN,
  BATTLEFIELD_ZOOM_STEP,
  GRID_SIZE,
} from "./playmat/constants";
import { HandZone } from "./playmat/HandZone";
import { PreviewOverlay } from "./playmat/PreviewOverlay";
import { SideZonePanel } from "./playmat/SideZonePanel";
import type {
  ActiveDragState,
  CardHoverInfo,
  DragCardData,
  DropTargetId,
  LibraryDropTarget,
  PreviewAnchor,
} from "./playmat/types";
import {
  getClientPositionFromEvent,
  getDropClientPosition,
  isZoneName,
  snapToGrid,
} from "./playmat/utils";
import {
  type ZonePreviewCard,
  ZonePreviewModal,
} from "./playmat/ZonePreviewModal";
import { TokenModal } from "./TokenModal";

type CenterToast = {
  id: string;
  message: string;
};

const PHASE_ORDER: TurnPhase[] = [
  "untap",
  "upkeep",
  "draw",
  "main1",
  "beginCombat",
  "declareAttackers",
  "declareBlockers",
  "combatDamage",
  "endCombat",
  "main2",
  "end",
  "cleanup",
];

export function Playmat({ playerName = "Você" }: { playerName?: string }) {
  const {
    state,
    dispatch,
    undo,
    redo,
    localPlayerId,
    player,
    allZones,
    zoneCount,
    activePings,
  } = useGameStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const graveyardRef = useRef<HTMLDivElement | null>(null);
  const exileRef = useRef<HTMLDivElement | null>(null);
  const libraryTopRef = useRef<HTMLDivElement | null>(null);
  const libraryBottomRef = useRef<HTMLDivElement | null>(null);
  const lastPointerClientPositionRef = useRef<{
    clientX: number;
    clientY: number;
  } | null>(null);

  const [previewCard, setPreviewCard] = useState<CardHoverInfo | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<PreviewAnchor | null>(
    null,
  );
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [zonePreview, setZonePreview] = useState<"graveyard" | "exile" | null>(
    null,
  );
  const [focusedBattlefieldCardId, setFocusedBattlefieldCardId] = useState<
    string | null
  >(null);
  const [battlefieldZoom, setBattlefieldZoom] = useState(1);

  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const [centerToast, setCenterToast] = useState<CenterToast | null>(null);
  const lastHandledLogIdRef = useRef<string | null>(null);

  const handDrop = useDroppable({ id: "hand" });
  const battlefieldDrop = useDroppable({ id: "battlefield" });
  const graveyardDrop = useDroppable({ id: "graveyard" });
  const exileDrop = useDroppable({ id: "exile" });
  const libraryTopDrop = useDroppable({ id: "library-top" });
  const libraryBottomDrop = useDroppable({ id: "library-bottom" });

  const isLibraryDropTarget = useCallback(
    (value: string): value is LibraryDropTarget => {
      return value === "library-top" || value === "library-bottom";
    },
    [],
  );

  const updatePreviewAnchor = useCallback((target: HTMLElement | null) => {
    if (!target) {
      setPreviewAnchor(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setPreviewAnchor({
      x: rect.left + rect.width / 2,
      y: Math.max(12, rect.top - 10),
    });
  }, []);

  const handleHover = useCallback((info: CardHoverInfo | null) => {
    setPreviewCard(info);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewCard(null);
    setPreviewAnchor(null);
  }, []);

  const handleDraw = useCallback(() => {
    if (zoneCount("library") === 0) return;
    dispatch({ type: "card/draw", playerId: localPlayerId, count: 1 });
  }, [dispatch, localPlayerId, zoneCount]);

  const handleShuffle = useCallback(() => {
    const library = shuffleCardIds(state.players[localPlayerId].zones.library);
    dispatch({
      type: "zone/shuffle",
      playerId: localPlayerId,
      zone: "library",
      orderedIds: library,
    });
  }, [dispatch, localPlayerId, state.players]);

  const resetDragState = useCallback(() => {
    setActiveDrag(null);
    lastPointerClientPositionRef.current = null;
    clearPreview();
  }, [clearPreview]);

  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerClientPositionRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch) return;

      lastPointerClientPositionRef.current = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      };
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeDrag]);

  useEffect(() => {
    const latestEntry = state.log.at(-1);
    if (!latestEntry) return;

    if (lastHandledLogIdRef.current === null) {
      lastHandledLogIdRef.current = latestEntry.id;
      return;
    }

    if (lastHandledLogIdRef.current === latestEntry.id) return;
    lastHandledLogIdRef.current = latestEntry.id;

    if (
      latestEntry.actionType !== "turn/passTurn" &&
      latestEntry.actionType !== "card/draw"
    ) {
      return;
    }

    setCenterToast({ id: latestEntry.id, message: latestEntry.description });
  }, [state.log]);

  useEffect(() => {
    if (!centerToast) return;

    const timeoutId = window.setTimeout(() => {
      setCenterToast((current) =>
        current?.id === centerToast.id ? null : current,
      );
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [centerToast]);

  const getCardZone = useCallback(
    (cardId: string) => {
      const zone = state.cardInstances[cardId]?.zone;
      return zone && isZoneName(zone) ? zone : null;
    },
    [state.cardInstances],
  );

  const getNextBattlefieldZ = useCallback(() => {
    return (
      allZones.battlefield.reduce((max, card) => {
        const cardZ = card.battlefield?.z ?? 0;
        return Math.max(max, cardZ);
      }, 0) + 1
    );
  }, [allZones.battlefield]);

  const getBattlefieldDropPosition = useCallback(
    (clientX: number, clientY: number) => {
      const rect = battlefieldRef.current?.getBoundingClientRect();
      const currentCount = allZones.battlefield.length;
      if (!rect) {
        return {
          x: 120 + (currentCount % 6) * 82,
          y: 80 + Math.floor(currentCount / 6) * 110,
          z: getNextBattlefieldZ(),
        };
      }

      const battlefieldWidth = rect.width / battlefieldZoom;
      const battlefieldHeight = rect.height / battlefieldZoom;
      const rawX = snapToGrid(
        (clientX - rect.left) / battlefieldZoom - BATTLEFIELD_CARD_WIDTH / 2,
      );
      const rawY = snapToGrid(
        (clientY - rect.top) / battlefieldZoom - BATTLEFIELD_CARD_HEIGHT / 2,
      );

      return {
        x: Math.max(
          12,
          Math.min(rawX, battlefieldWidth - BATTLEFIELD_CARD_WIDTH - 12),
        ),
        y: Math.max(
          12,
          Math.min(rawY, battlefieldHeight - BATTLEFIELD_CARD_HEIGHT - 12),
        ),
        z: getNextBattlefieldZ(),
      };
    },
    [allZones.battlefield.length, battlefieldZoom, getNextBattlefieldZ],
  );

  const clampBattlefieldZoom = useCallback((value: number) => {
    return Math.max(
      BATTLEFIELD_ZOOM_MIN,
      Math.min(value, BATTLEFIELD_ZOOM_MAX),
    );
  }, []);

  const adjustBattlefieldZoom = useCallback(
    (delta: number) => {
      setBattlefieldZoom((prev) => clampBattlefieldZoom(prev + delta));
    },
    [clampBattlefieldZoom],
  );

  const handleBattlefieldWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const delta =
        event.deltaY < 0 ? BATTLEFIELD_ZOOM_STEP : -BATTLEFIELD_ZOOM_STEP;
      adjustBattlefieldZoom(delta);
    },
    [adjustBattlefieldZoom],
  );

  const handleTapFocusedBattlefieldCard = useCallback(() => {
    if (!focusedBattlefieldCardId) return;

    const card = state.cardInstances[focusedBattlefieldCardId];
    if (!card || card.zone !== "battlefield") return;

    dispatch({
      type: "card/setTapped",
      cardId: card.id,
      tapped: !card.tapped,
    });
  }, [dispatch, focusedBattlefieldCardId, state.cardInstances]);

  const getZoneByClientPosition = useCallback(
    (clientX: number, clientY: number) => {
      const zonesByPriority: Array<{
        zone: DropTargetId;
        rect: DOMRect | null | undefined;
      }> = [
        {
          zone: "graveyard",
          rect: graveyardRef.current?.getBoundingClientRect(),
        },
        { zone: "exile", rect: exileRef.current?.getBoundingClientRect() },
        {
          zone: "library-top",
          rect: libraryTopRef.current?.getBoundingClientRect(),
        },
        {
          zone: "library-bottom",
          rect: libraryBottomRef.current?.getBoundingClientRect(),
        },
        { zone: "hand", rect: handRef.current?.getBoundingClientRect() },
        {
          zone: "battlefield",
          rect: battlefieldRef.current?.getBoundingClientRect(),
        },
      ];

      const zoneByCursor = zonesByPriority.find(({ rect }) => {
        if (!rect) return false;
        return (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        );
      });

      return zoneByCursor?.zone ?? null;
    },
    [],
  );

  const resolveDropZone = useCallback(
    (
      event: { over: DragEndEvent["over"] | DragOverEvent["over"] },
      cardId: string,
    ) => {
      const overId = event.over?.id;
      if (overId) {
        const nextOverId = String(overId);

        if (isZoneName(nextOverId)) {
          return nextOverId as DropTargetId;
        }

        if (isLibraryDropTarget(nextOverId)) {
          return nextOverId;
        }
      }

      const currentPosition =
        lastPointerClientPositionRef.current ??
        getDropClientPosition(event as DragEndEvent);
      if (currentPosition) {
        const zoneByCursor = getZoneByClientPosition(
          currentPosition.clientX,
          currentPosition.clientY,
        );
        if (zoneByCursor) {
          return zoneByCursor;
        }
      }

      if (overId && String(overId) !== cardId) {
        const overCard = state.cardInstances[String(overId)];
        if (overCard && isZoneName(overCard.zone)) {
          return overCard.zone;
        }
      }

      return null;
    },
    [getZoneByClientPosition, isLibraryDropTarget, state.cardInstances],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const dragData = event.active.data.current as DragCardData | undefined;
      if (!dragData) return;

      const currentZone = getCardZone(dragData.cardId) ?? dragData.from;
      lastPointerClientPositionRef.current = getClientPositionFromEvent(
        event.activatorEvent,
      );
      clearPreview();

      if (currentZone === "library") {
        dispatch({ type: "card/draw", playerId: localPlayerId, count: 1 });
        setActiveDrag({
          cardId: dragData.cardId,
          from: "hand",
          over: "hand",
          origin: "library",
        });
        return;
      }

      setActiveDrag({
        cardId: dragData.cardId,
        from: currentZone,
        over: currentZone,
        origin: currentZone,
      });
    },
    [clearPreview, dispatch, getCardZone, localPlayerId],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const dragData = event.active.data.current as DragCardData | undefined;
      if (!dragData) return;

      const from = getCardZone(dragData.cardId) ?? dragData.from;
      const over = resolveDropZone(event, dragData.cardId);
      setActiveDrag((current) => ({
        cardId: dragData.cardId,
        from,
        over,
        origin:
          current?.cardId === dragData.cardId ? current.origin : dragData.from,
      }));
    },
    [getCardZone, resolveDropZone],
  );

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      resetDragState();
    },
    [resetDragState],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const dragData = event.active.data.current as DragCardData | undefined;
      if (!dragData) {
        resetDragState();
        return;
      }

      const fromZone = getCardZone(dragData.cardId) ?? dragData.from;
      const toTarget =
        resolveDropZone(event, dragData.cardId) ?? activeDrag?.over ?? null;
      if (!toTarget) {
        resetDragState();
        return;
      }

      const isLibraryPlacement = isLibraryDropTarget(toTarget);
      const toZone = isLibraryPlacement ? "library" : toTarget;

      if (toZone === "battlefield") {
        if (fromZone === "battlefield") {
          const dragDistance = Math.hypot(event.delta.x, event.delta.y);
          if (dragDistance < GRID_SIZE / 2) {
            resetDragState();
            return;
          }
        }

        const cursor = getDropClientPosition(event);
        const fallbackCard = state.cardInstances[dragData.cardId];

        const position = cursor
          ? getBattlefieldDropPosition(cursor.clientX, cursor.clientY)
          : {
              x: fallbackCard?.battlefield?.x ?? 80,
              y: fallbackCard?.battlefield?.y ?? 80,
              z: getNextBattlefieldZ(),
            };

        if (fromZone !== "battlefield") {
          dispatch({
            type: "card/move",
            cardId: dragData.cardId,
            from: fromZone,
            to: "battlefield",
            toPlayerId: localPlayerId,
          });
        }

        dispatch({
          type: "card/setBattlefieldPosition",
          cardId: dragData.cardId,
          x: position.x,
          y: position.y,
          z: position.z,
        });

        resetDragState();
        return;
      }

      if (fromZone !== toZone || isLibraryPlacement) {
        const libraryIndex =
          toTarget === "library-top"
            ? 0
            : toTarget === "library-bottom"
              ? state.players[localPlayerId].zones.library.length
              : undefined;

        dispatch({
          type: "card/move",
          cardId: dragData.cardId,
          from: fromZone,
          to: toZone,
          toPlayerId: localPlayerId,
          ...(libraryIndex !== undefined ? { index: libraryIndex } : {}),
        });
      }

      resetDragState();
    },
    [
      dispatch,
      activeDrag?.over,
      getBattlefieldDropPosition,
      getCardZone,
      getNextBattlefieldZ,
      isLibraryDropTarget,
      localPlayerId,
      resolveDropZone,
      resetDragState,
      state.cardInstances,
      state.players,
    ],
  );

  const handleRetreatPhase = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(state.phase);
    if (idx <= 0) return;
    const previousPhase = PHASE_ORDER[idx - 1];
    if (!previousPhase) return;
    dispatch({ type: "turn/setPhase", phase: previousPhase });
  }, [dispatch, state.phase]);

  useKeyboardShortcuts({
    onTap: handleTapFocusedBattlefieldCard,
    onDraw: handleDraw,
    onShuffle: handleShuffle,
    onAdvancePhase: () => dispatch({ type: "turn/passTurn" }),
    onRetreatPhase: handleRetreatPhase,
    onUndo: undo,
    onRedo: redo,
  });

  const life = player?.life ?? 20;
  const turnLabel = `Turno ${state.turnNumber}`;

  const handCards = allZones.hand.map((card) => {
    const selected = selectCardWithDefinition(state, card.id);
    return {
      card,
      name: selected?.definition.name ?? "carta",
      imageUrl: selected?.definition.imageUrl ?? null,
      manaCost: selected?.definition.manaCost ?? "",
    };
  });

  const battlefieldCards = allZones.battlefield.map((card) => {
    const selected = selectCardWithDefinition(state, card.id);
    const definitionType = selected?.definition.type ?? "";
    const definitionPower = selected?.definition.power ?? null;
    const definitionToughness = selected?.definition.toughness ?? null;
    const cardType = card.tokenData?.type ?? definitionType;
    const power = card.tokenData?.power ?? definitionPower;
    const toughness = card.tokenData?.toughness ?? definitionToughness;

    return {
      card,
      name: selected?.definition.name ?? "carta",
      imageUrl: card.faceDown ? null : (selected?.definition.imageUrl ?? null),
      manaCost: selected?.definition.manaCost ?? "",
      cardType,
      power,
      toughness,
    };
  });

  const activeDragCard = activeDrag
    ? selectCardWithDefinition(state, activeDrag.cardId)
    : null;

  const graveyardTop = allZones.graveyard.at(-1);
  const exileTop = allZones.exile.at(-1);
  const libraryTop = allZones.library[0] ?? null;

  const graveyardPreviewCards: ZonePreviewCard[] = allZones.graveyard.map(
    (card) => {
      const selected = selectCardWithDefinition(state, card.id);
      return {
        id: card.id,
        name:
          card.customName ??
          card.tokenData?.name ??
          selected?.definition.name ??
          "Carta",
        imageUrl:
          card.tokenData?.imageUrl ?? selected?.definition.imageUrl ?? null,
      };
    },
  );

  const exilePreviewCards: ZonePreviewCard[] = allZones.exile.map((card) => {
    const selected = selectCardWithDefinition(state, card.id);
    return {
      id: card.id,
      name:
        card.customName ??
        card.tokenData?.name ??
        selected?.definition.name ??
        "Carta",
      imageUrl:
        card.tokenData?.imageUrl ?? selected?.definition.imageUrl ?? null,
    };
  });

  const getStackTopInfo = useCallback(
    (card: CardInstance | undefined) => {
      if (!card) return null;
      const selected = selectCardWithDefinition(state, card.id);
      return {
        name:
          card.customName ??
          card.tokenData?.name ??
          selected?.definition.name ??
          "Carta",
        imageUrl:
          card.tokenData?.imageUrl ?? selected?.definition.imageUrl ?? null,
      };
    },
    [state],
  );

  const graveyardTopInfo = getStackTopInfo(graveyardTop);
  const exileTopInfo = getStackTopInfo(exileTop);
  const isAnyDragActive = Boolean(activeDrag);
  const hiddenHandCardId =
    activeDrag?.origin === "library" ? activeDrag.cardId : null;

  const handleHoverWithAnchor = useCallback(
    (info: CardHoverInfo | null, target: HTMLElement | null) => {
      handleHover(info);
      updatePreviewAnchor(target);
    },
    [handleHover, updatePreviewAnchor],
  );

  const handleBattlefieldHover = useCallback(
    (
      cardId: string,
      info: CardHoverInfo | null,
      target: HTMLElement | null,
    ) => {
      handleHoverWithAnchor(info, target);
      setFocusedBattlefieldCardId(info ? cardId : null);
    },
    [handleHoverWithAnchor],
  );

  const handleHandHover = useCallback(
    (info: CardHoverInfo | null, target: HTMLElement | null) => {
      handleHoverWithAnchor(info, target);
      setFocusedBattlefieldCardId(null);
    },
    [handleHoverWithAnchor],
  );

  const handleChangeLife = useCallback(
    (delta: number) => {
      dispatch({
        type: "player/changeLife",
        playerId: localPlayerId,
        delta,
        at: Date.now(),
      });
    },
    [dispatch, localPlayerId],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <section
        id="player-battlefield"
        className="flex flex-col gap-4 rounded-2xl h-full  flex-1"
      >
        {/* Local player battlefield */}
        <div
          id="battlefield"
          className="min-h-0 overflow-hidden"
          style={{ flex: "1 1 0" }}
        >
          <BattlefieldArea
            setRefs={(node) => {
              battlefieldRef.current = node;
              battlefieldDrop.setNodeRef(node);
            }}
            isActiveDropTarget={battlefieldDrop.isOver}
            isAnyDragActive={isAnyDragActive}
            interactive={true}
            isActiveTurn={true}
            orientation="bottom"
            playerName={playerName}
            life={life}
            turnLabel={turnLabel}
            battlefieldZoom={battlefieldZoom}
            battlefieldCards={battlefieldCards}
            activePings={activePings}
            onWheel={handleBattlefieldWheel}
            onChangeLife={handleChangeLife}
            onAdjustZoom={adjustBattlefieldZoom}
            onHoverCard={handleBattlefieldHover}
            onPingCard={(cardId) => dispatch({ type: "card/ping", cardId })}
          />
        </div>

        <div
          id="player-side-zone"
          className="flex flex-row items-end justify-end gap-4 -mb-16 relative z-10"
        >
          <HandZone
            setRefs={(node) => {
              handRef.current = node;
              handDrop.setNodeRef(node);
            }}
            isActiveDropTarget={handDrop.isOver}
            isAnyDragActive={isAnyDragActive}
            hiddenCardId={hiddenHandCardId}
            handCards={handCards}
            onHoverCard={handleHandHover}
          />

          <SideZonePanel
            graveyardTop={graveyardTop}
            graveyardTopName={graveyardTopInfo?.name ?? "Carta"}
            graveyardTopImageUrl={graveyardTopInfo?.imageUrl ?? null}
            graveyardCount={zoneCount("graveyard")}
            graveyardIsOver={graveyardDrop.isOver}
            setGraveyardRef={(node) => {
              graveyardRef.current = node;
              graveyardDrop.setNodeRef(node);
            }}
            onViewGraveyard={() => setZonePreview("graveyard")}
            onHoverGraveyardTop={handleHoverWithAnchor}
            exileTop={exileTop}
            exileTopName={exileTopInfo?.name ?? "Carta"}
            exileTopImageUrl={exileTopInfo?.imageUrl ?? null}
            exileCount={zoneCount("exile")}
            exileIsOver={exileDrop.isOver}
            setExileRef={(node) => {
              exileRef.current = node;
              exileDrop.setNodeRef(node);
            }}
            onViewExile={() => setZonePreview("exile")}
            onHoverExileTop={handleHoverWithAnchor}
            libraryTopId={libraryTop?.id ?? null}
            libraryCount={zoneCount("library")}
            libraryTopIsOver={libraryTopDrop.isOver}
            libraryBottomIsOver={libraryBottomDrop.isOver}
            setLibraryTopRef={(node) => {
              libraryTopRef.current = node;
              libraryTopDrop.setNodeRef(node);
            }}
            setLibraryBottomRef={(node) => {
              libraryBottomRef.current = node;
              libraryBottomDrop.setNodeRef(node);
            }}
            isAnyDragActive={isAnyDragActive}
            onDraw={handleDraw}
          />
        </div>
      </section>

      <PreviewOverlay previewCard={previewCard} previewAnchor={previewAnchor} />

      <ZonePreviewModal
        zone={zonePreview}
        cards={
          zonePreview === "graveyard"
            ? graveyardPreviewCards
            : exilePreviewCards
        }
        onClose={() => setZonePreview(null)}
        onHoverCard={handleHoverWithAnchor}
      />

      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onConfirm={(definition, instance) => {
          dispatch({
            type: "token/create",
            playerId: localPlayerId,
            definition,
            instance,
          });
        }}
        playerId={localPlayerId}
      />

      {centerToast ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-6 z-[500] flex justify-center px-4"
          aria-live="polite"
        >
          <div className="rounded-xl border border-white/15 bg-black/70 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md">
            {centerToast.message}
          </div>
        </div>
      ) : null}

      <DragOverlay zIndex={400}>
        {activeDragCard &&
        (activeDrag?.origin === "battlefield" ||
          activeDrag?.origin === "library") ? (
          <div
            className="overflow-hidden rounded-[4px] shadow-2xl ring-1 ring-white/15"
            style={{
              width: `${BATTLEFIELD_CARD_WIDTH}px`,
              height: `${BATTLEFIELD_CARD_HEIGHT}px`,
            }}
          >
            {activeDragCard.definition.imageUrl ? (
              <Image
                src={activeDragCard.definition.imageUrl}
                alt={activeDragCard.definition.name}
                width={BATTLEFIELD_CARD_WIDTH}
                height={BATTLEFIELD_CARD_HEIGHT}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <CardBack className="h-full w-full" />
            )}
          </div>
        ) : null}
      </DragOverlay>

      {activeDrag && (
        <div
          className="pointer-events-none fixed inset-0 z-[150]"
          aria-hidden="true"
        />
      )}
    </DndContext>
  );
}
