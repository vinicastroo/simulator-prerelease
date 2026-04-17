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
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { generateCardDefId, generateCardInstanceId } from "@/lib/game/ids";
import { selectCardWithDefinition } from "@/lib/game/selectors";
import { shuffleCardIds } from "@/lib/game/shuffle";
import type { CardInstance, TurnPhase } from "@/lib/game/types";
import { useGameStore } from "../store/useGameStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { CardBack } from "./CardBack";
import { BattlefieldArea } from "./playmat/BattlefieldArea";
import {
  type ArrowCoordinateSpace,
  BattlefieldArrowOverlay,
  toCanvasNormalized,
  toViewportNormalized,
} from "./playmat/BattlefieldArrowOverlay";
import { BattlefieldCardMenu } from "./playmat/BattlefieldCardMenu";
import { BattlefieldContextMenu } from "./playmat/BattlefieldContextMenu";
import {
  BattlefieldTokenBrowser,
  type TokenCard,
} from "./playmat/BattlefieldTokenBrowser";
import {
  BATTLEFIELD_CARD_HEIGHT,
  BATTLEFIELD_CARD_WIDTH,
  BATTLEFIELD_ZOOM_MAX,
  BATTLEFIELD_ZOOM_MIN,
  BATTLEFIELD_ZOOM_STEP,
  GRID_SIZE,
  HAND_CARD_SPACING,
} from "./playmat/constants";
import { HandZone } from "./playmat/HandZone";
import {
  HoverPreviewHost,
  type HoverPreviewHandle,
} from "./playmat/HoverPreviewHost";
import { SideZonePanel } from "./playmat/SideZonePanel";
import type {
  ActiveDragState,
  CardHoverInfo,
  DragCardData,
  DropTargetId,
  LibraryDropTarget,
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

export function Playmat({
  playerName = "Você",
  isRollingForFirstTurn = false,
  allowInfiniteBattlefieldZoom = false,
  arrowCoordinateSpace = "canvas",
  arrowContainerEl = null,
}: {
  playerName?: string;
  isRollingForFirstTurn?: boolean;
  allowInfiniteBattlefieldZoom?: boolean;
  arrowCoordinateSpace?: ArrowCoordinateSpace;
  arrowContainerEl?: HTMLDivElement | null;
}) {
  const {
    state,
    dispatch,

    localPlayerId,
    player,
    allZones,
    zoneCount,
    activePings,
  } = useGameStore();
  const {
    activePlayerId,
    battlefieldArrows: allBattlefieldArrows,
    cardInstances,
    log,
    phase,
    players,
    turnNumber,
  } = state;

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
  // Always-current refs for arrow-mode calculation (avoids stale closure in
  // handleToggleArrowMode which has [] deps and is invoked via keyboard shortcut).
  const battlefieldContainerElRef = useRef<HTMLDivElement | null>(null);
  const battlefieldPanRef = useRef({ x: 0, y: 0 });
  const battlefieldZoomRef = useRef(BATTLEFIELD_ZOOM_MIN);

  const [zonePreview, setZonePreview] = useState<"graveyard" | "exile" | null>(
    null,
  );
  const [focusedBattlefieldCardId, setFocusedBattlefieldCardId] = useState<
    string | null
  >(null);
  const [selectedBattlefieldCardIds, setSelectedBattlefieldCardIds] = useState<
    string[]
  >([]);
  const [isArrowMode, setIsArrowMode] = useState(false);
  const [pendingArrowStart, setPendingArrowStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pendingArrowEnd, setPendingArrowEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [battlefieldZoom, setBattlefieldZoom] = useState(BATTLEFIELD_ZOOM_MIN);
  const [battlefieldPan, setBattlefieldPan] = useState({ x: 0, y: 0 });
  // Keep refs current every render so handleToggleArrowMode ([] deps) always
  // reads the latest pan/zoom when computing the arrow start point.
  battlefieldPanRef.current = battlefieldPan;
  battlefieldZoomRef.current = battlefieldZoom;

  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const [centerToast, setCenterToast] = useState<CenterToast | null>(null);
  const lastHandledLogIdRef = useRef<string | null>(null);
  const hoverPreviewRef = useRef<HoverPreviewHandle | null>(null);
  const nextTurnAudioRef = useRef<HTMLAudioElement | null>(null);

  type CardMenuState = { cardId: string; x: number; y: number };
  const [cardMenu, setCardMenu] = useState<CardMenuState | null>(null);

  type ContextMenuState = { x: number; y: number };
  const [battlefieldContextMenu, setBattlefieldContextMenu] =
    useState<ContextMenuState | null>(null);
  const [tokenBrowserOpen, setTokenBrowserOpen] = useState(false);
  // Store where the user right-clicked so tokens land near that spot
  const battlefieldContextPositionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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

  const clearPreview = useCallback(() => {
    hoverPreviewRef.current?.clear();
  }, []);

  const handleDraw = useCallback(() => {
    if (zoneCount("library") === 0) return;
    dispatch({ type: "card/draw", playerId: localPlayerId, count: 1 });
  }, [dispatch, localPlayerId, zoneCount]);

  const handleShuffle = useCallback(() => {
    const library = shuffleCardIds(players[localPlayerId].zones.library);
    dispatch({
      type: "zone/shuffle",
      playerId: localPlayerId,
      zone: "library",
      orderedIds: library,
    });
  }, [dispatch, localPlayerId, players]);

  const resetDragState = useCallback(() => {
    setActiveDrag(null);
    clearPreview();
  }, [clearPreview]);

  useEffect(() => {
    const updateLastPointerPosition = (clientX: number, clientY: number) => {
      lastPointerClientPositionRef.current = {
        clientX,
        clientY,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateLastPointerPosition(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateLastPointerPosition(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch) return;

      updateLastPointerPosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const latestEntry = log.at(-1);
    if (!latestEntry) return;

    if (lastHandledLogIdRef.current === null) {
      lastHandledLogIdRef.current = latestEntry.id;
      return;
    }

    if (lastHandledLogIdRef.current === latestEntry.id) return;
    lastHandledLogIdRef.current = latestEntry.id;

    if (latestEntry.actionType === "turn/passTurn") {
      const audio = nextTurnAudioRef.current ?? new Audio("/next-turn.mp3");
      audio.volume = 0.3;
      audio.currentTime = 0;
      nextTurnAudioRef.current = audio;
      void audio.play().catch(() => {});
    }

    if (
      latestEntry.actionType !== "turn/passTurn" &&
      latestEntry.actionType !== "card/draw"
    ) {
      return;
    }

    setCenterToast({ id: latestEntry.id, message: latestEntry.description });
  }, [log]);

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
      const zone = cardInstances[cardId]?.zone;
      return zone && isZoneName(zone) ? zone : null;
    },
    [cardInstances],
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

      const rawX = snapToGrid(
        (clientX - rect.left - battlefieldPan.x) / battlefieldZoom -
          BATTLEFIELD_CARD_WIDTH / 2,
      );
      const rawY = snapToGrid(
        (clientY - rect.top - battlefieldPan.y) / battlefieldZoom -
          BATTLEFIELD_CARD_HEIGHT / 2,
      );

      return {
        x: Math.max(0, rawX),
        y: Math.max(0, rawY),
        z: getNextBattlefieldZ(),
      };
    },
    [
      allZones.battlefield.length,
      battlefieldPan,
      battlefieldZoom,
      getNextBattlefieldZ,
    ],
  );

  const clampBattlefieldZoom = useCallback((value: number) => {
    return Math.max(
      BATTLEFIELD_ZOOM_MIN,
      Math.min(value, BATTLEFIELD_ZOOM_MAX),
    );
  }, []);

  const getNextBattlefieldZoom = useCallback(
    (current: number, delta: number) => {
      const factor = 1 + Math.abs(delta);
      const next = delta >= 0 ? current * factor : current / factor;

      if (!allowInfiniteBattlefieldZoom) {
        return clampBattlefieldZoom(next);
      }

      return Math.max(0.001, Math.min(next, 1000));
    },
    [allowInfiniteBattlefieldZoom, clampBattlefieldZoom],
  );

  const adjustBattlefieldZoom = useCallback(
    (delta: number) => {
      setBattlefieldZoom((prev) => getNextBattlefieldZoom(prev, delta));
    },
    [getNextBattlefieldZoom],
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

  useEffect(() => {
    setSelectedBattlefieldCardIds((current) =>
      current.filter((cardId) => cardInstances[cardId]?.zone === "battlefield"),
    );
    setFocusedBattlefieldCardId((current) =>
      current && cardInstances[current]?.zone === "battlefield"
        ? current
        : null,
    );
  }, [cardInstances]);

  const handleSelectBattlefieldCard = useCallback(
    (cardId: string, additive: boolean) => {
      setFocusedBattlefieldCardId(cardId);
      setSelectedBattlefieldCardIds((current) => {
        if (!additive) return [cardId];

        return current.includes(cardId)
          ? current.filter((id) => id !== cardId)
          : [...current, cardId];
      });
    },
    [],
  );

  const handleClearBattlefieldSelection = useCallback(() => {
    setSelectedBattlefieldCardIds([]);
    setFocusedBattlefieldCardId(null);
  }, []);

  const handleToggleArrowMode = useCallback(() => {
    setIsArrowMode((current) => {
      const next = !current;

      if (!next) {
        setPendingArrowStart(null);
        setPendingArrowEnd(null);
        return next;
      }

      const pointer = lastPointerClientPositionRef.current;
      if (!pointer) {
        setPendingArrowStart(null);
        setPendingArrowEnd(null);
        return next;
      }

      // Convert cursor position to canvas-normalized coordinates using the
      // same transform as the overlay's onPointerMove handler, so the start
      // point is always in the correct coordinate space regardless of pan/zoom.
      const start =
        arrowCoordinateSpace === "viewport"
          ? toViewportNormalized(
              pointer.clientX,
              pointer.clientY,
              arrowContainerEl,
            )
          : toCanvasNormalized(
              pointer.clientX,
              pointer.clientY,
              battlefieldContainerElRef.current,
              battlefieldPanRef.current,
              battlefieldZoomRef.current,
            );

      if (!start) {
        // Container not mounted yet — first onPointerMove will set the start.
        setPendingArrowStart(null);
        setPendingArrowEnd(null);
        return next;
      }

      setPendingArrowStart(start);
      setPendingArrowEnd(start);
      return next;
    });
  }, [arrowContainerEl, arrowCoordinateSpace]);

  const handleCancelArrowMode = useCallback(() => {
    setIsArrowMode(false);
    setPendingArrowStart(null);
    setPendingArrowEnd(null);
  }, []);

  const handleArrowPointerMove = useCallback(
    (point: { x: number; y: number }) => {
      if (!isArrowMode) return;

      if (!pendingArrowStart) {
        setPendingArrowStart(point);
        setPendingArrowEnd(point);
        return;
      }

      setPendingArrowEnd(point);
    },
    [isArrowMode, pendingArrowStart],
  );

  const handleArrowCanvasClick = useCallback(
    (point: { x: number; y: number }) => {
      if (!isArrowMode) return;

      if (!pendingArrowStart) {
        setPendingArrowStart(point);
        setPendingArrowEnd(point);
        return;
      }

      const normalizePoint = (rawPoint: { x: number; y: number }) => ({
        x: Math.min(Math.max(rawPoint.x, 0), 1),
        y: Math.min(Math.max(rawPoint.y, 0), 1),
      });

      dispatch({
        type: "battlefield-arrow/create",
        arrow: {
          id: crypto.randomUUID(),
          playerId: localPlayerId,
          createdByPlayerId: localPlayerId,
          start: normalizePoint(pendingArrowStart),
          end: normalizePoint(point),
        },
      });
      setIsArrowMode(false);
      setPendingArrowStart(null);
      setPendingArrowEnd(null);
    },
    [dispatch, isArrowMode, localPlayerId, pendingArrowStart],
  );

  const handleDeleteArrow = useCallback(
    (arrowId: string) => {
      dispatch({ type: "battlefield-arrow/remove", arrowId });
    },
    [dispatch],
  );

  const getDraggedBattlefieldCardIds = useCallback(
    (cardId: string) => {
      if (!selectedBattlefieldCardIds.includes(cardId)) {
        return [cardId];
      }

      const orderedSelectedIds = allZones.battlefield
        .map((card) => card.id)
        .filter((id) => selectedBattlefieldCardIds.includes(id));

      return orderedSelectedIds.length > 0 ? orderedSelectedIds : [cardId];
    },
    [allZones.battlefield, selectedBattlefieldCardIds],
  );

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

        // Modal library drop zones
        if (nextOverId === "modal-battlefield") return "battlefield";
        if (nextOverId === "modal-hand") return "hand";
        if (nextOverId === "modal-graveyard") return "graveyard";
        if (nextOverId === "modal-exile") return "exile";
        if (nextOverId === "modal-cancel") return null;

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
        const overCard = cardInstances[String(overId)];
        if (overCard && isZoneName(overCard.zone)) {
          return overCard.zone;
        }
      }

      return null;
    },
    [cardInstances, getZoneByClientPosition, isLibraryDropTarget],
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

      if (
        currentZone === "library" &&
        dragData.behavior !== "move-from-library"
      ) {
        dispatch({ type: "card/draw", playerId: localPlayerId, count: 1 });
        setActiveDrag({
          cardId: dragData.cardId,
          cardIds: [dragData.cardId],
          from: "hand",
          over: "hand",
          origin: "library",
        });
        return;
      }

      const draggedCardIds =
        currentZone === "battlefield"
          ? getDraggedBattlefieldCardIds(dragData.cardId)
          : [dragData.cardId];

      setActiveDrag({
        cardId: dragData.cardId,
        cardIds: draggedCardIds,
        from: currentZone,
        over: currentZone,
        origin: currentZone,
      });
    },
    [
      clearPreview,
      dispatch,
      getCardZone,
      getDraggedBattlefieldCardIds,
      localPlayerId,
    ],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const dragData = event.active.data.current as DragCardData | undefined;
      if (!dragData) return;

      const from = getCardZone(dragData.cardId) ?? dragData.from;
      const over = resolveDropZone(event, dragData.cardId);
      setActiveDrag((current) => ({
        cardId: dragData.cardId,
        cardIds:
          current?.cardId === dragData.cardId
            ? current.cardIds
            : [dragData.cardId],
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

      // Cancel zone — abort without doing anything
      if (String(event.over?.id ?? "") === "modal-cancel") {
        resetDragState();
        return;
      }

      const fromZone = getCardZone(dragData.cardId) ?? dragData.from;
      const draggedCardIds =
        activeDrag?.cardId === dragData.cardId
          ? activeDrag.cardIds
          : [dragData.cardId];
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

        // When dropped via modal zone the cursor is over the modal, not the
        // battlefield — skip cursor-based positioning and use the auto-layout fallback.
        const isModalDrop = String(event.over?.id ?? "").startsWith("modal-");
        // Use the actual pointer position for accurate placement; fall back to
        // the card's translated center if pointer tracking is unavailable.
        const cursor = isModalDrop
          ? null
          : (lastPointerClientPositionRef.current ??
            getDropClientPosition(event));
        const fallbackCard = cardInstances[dragData.cardId];

        const position = cursor
          ? getBattlefieldDropPosition(cursor.clientX, cursor.clientY)
          : {
              x: fallbackCard?.battlefield?.x ?? 80,
              y: fallbackCard?.battlefield?.y ?? 80,
              z: getNextBattlefieldZ(),
            };

        if (fromZone === "battlefield" && draggedCardIds.length > 1) {
          const draggedCards = draggedCardIds
            .map((cardId) => {
              const card = cardInstances[cardId];
              return card?.battlefield
                ? { cardId, battlefield: card.battlefield }
                : null;
            })
            .filter(
              (
                card,
              ): card is {
                cardId: string;
                battlefield: NonNullable<CardInstance["battlefield"]>;
              } => card !== null,
            );

          if (draggedCards.length > 0) {
            const nextZ = getNextBattlefieldZ();
            const spacing = BATTLEFIELD_CARD_WIDTH + GRID_SIZE / 2;
            const startX =
              position.x - ((draggedCards.length - 1) * spacing) / 2;

            draggedCards.forEach(({ cardId }, index) => {
              dispatch({
                type: "card/setBattlefieldPosition",
                cardId,
                x: Math.max(0, startX + index * spacing),
                y: Math.max(0, position.y),
                z: nextZ + index,
              });
            });
          }

          resetDragState();
          return;
        }

        if (fromZone !== "battlefield") {
          dispatch({
            type: "card/move",
            cardId: dragData.cardId,
            from: fromZone,
            to: "battlefield",
            toPlayerId: localPlayerId,
            battlefieldPosition: position,
          });
        } else {
          dispatch({
            type: "card/setBattlefieldPosition",
            cardId: dragData.cardId,
            x: position.x,
            y: position.y,
            z: position.z,
          });
        }

        resetDragState();
        return;
      }

      // Hand reorder: dropped back onto the hand zone — reorder by pointer X position
      if (fromZone === "hand" && toZone === "hand") {
        const pointerPos = lastPointerClientPositionRef.current;
        const handRect = handRef.current?.getBoundingClientRect();
        const currentHand = players[localPlayerId].zones.hand;

        if (pointerPos && handRect && currentHand.length > 1) {
          const handCenterX = handRect.left + handRect.width / 2;
          const rawIndex =
            (pointerPos.clientX - handCenterX) / HAND_CARD_SPACING +
            (currentHand.length - 1) / 2;
          const targetIndex = Math.max(
            0,
            Math.min(currentHand.length - 1, Math.round(rawIndex)),
          );
          const oldIndex = currentHand.indexOf(dragData.cardId);

          if (oldIndex !== -1 && oldIndex !== targetIndex) {
            const newHand = [...currentHand];
            newHand.splice(oldIndex, 1);
            newHand.splice(targetIndex, 0, dragData.cardId);
            dispatch({
              type: "zone/reorder",
              playerId: localPlayerId,
              zone: "hand",
              orderedIds: newHand,
            });
          }
        }

        resetDragState();
        return;
      }

      if (fromZone !== toZone || isLibraryPlacement) {
        const libraryIndex =
          toTarget === "library-top"
            ? 0
            : toTarget === "library-bottom"
              ? players[localPlayerId].zones.library.length
              : undefined;

        const orderedCardIds =
          toTarget === "library-top"
            ? [...draggedCardIds].reverse()
            : draggedCardIds;

        if (fromZone === "battlefield" && orderedCardIds.length > 1) {
          dispatch({
            type: "card/moveMany",
            cardIds: orderedCardIds,
            to: toZone,
            toPlayerId: localPlayerId,
            ...(libraryIndex !== undefined ? { index: libraryIndex } : {}),
          });
          resetDragState();
          return;
        }

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
      activeDrag?.cardId,
      activeDrag?.cardIds,
      activeDrag?.over,
      getBattlefieldDropPosition,
      getCardZone,
      getNextBattlefieldZ,
      isLibraryDropTarget,
      localPlayerId,
      resolveDropZone,
      resetDragState,
      cardInstances,
      players,
    ],
  );

  const handleRetreatPhase = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx <= 0) return;
    const previousPhase = PHASE_ORDER[idx - 1];
    if (!previousPhase) return;
    dispatch({ type: "turn/setPhase", phase: previousPhase });
  }, [dispatch, phase]);

  useKeyboardShortcuts({
    onTap: handleTapFocusedBattlefieldCard,
    onDraw: handleDraw,
    onShuffle: handleShuffle,
    onAdvancePhase: () => {
      if (state.activePlayerId !== localPlayerId) return;
      dispatch({ type: "turn/passTurn" });
    },
    onRetreatPhase: handleRetreatPhase,

    onToggleArrowMode: handleToggleArrowMode,
    onCancelArrowMode: handleCancelArrowMode,
  });

  const life = player?.life ?? 20;
  const turnLabel = `Turno ${turnNumber}`;

  const handCards = useMemo(
    () =>
      allZones.hand.map((card) => {
        const selected = selectCardWithDefinition(state, card.id);
        return {
          card,
          name: selected?.definition.name ?? "carta",
          imageUrl: selected?.definition.imageUrl ?? null,
          manaCost: selected?.definition.manaCost ?? "",
        };
      }),
    [allZones.hand, state],
  );

  const battlefieldCards = useMemo(
    () =>
      allZones.battlefield.map((card) => {
        const selected = selectCardWithDefinition(state, card.id);
        const definitionType = selected?.definition.type ?? "";
        const definitionPower = selected?.definition.power ?? null;
        const definitionToughness = selected?.definition.toughness ?? null;
        const cardType = card.tokenData?.type ?? definitionType;
        const power = definitionPower ?? card.tokenData?.power ?? null;
        const toughness =
          definitionToughness ?? card.tokenData?.toughness ?? null;

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
      }),
    [allZones.battlefield, state],
  );

  const activeDragCard = useMemo(
    () =>
      activeDrag ? selectCardWithDefinition(state, activeDrag.cardId) : null,
    [activeDrag, state],
  );
  const activeDragCards = useMemo(
    () =>
      activeDrag
        ? activeDrag.cardIds
            .map((cardId) => selectCardWithDefinition(state, cardId))
            .filter((card): card is NonNullable<typeof card> => card !== null)
        : [],
    [activeDrag, state],
  );

  const graveyardTop = allZones.graveyard.at(-1);
  const exileTop = allZones.exile.at(-1);
  const libraryTop = allZones.library[0] ?? null;

  const graveyardPreviewCards: ZonePreviewCard[] = useMemo(
    () =>
      allZones.graveyard.map((card) => {
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
      }),
    [allZones.graveyard, state],
  );

  const exilePreviewCards: ZonePreviewCard[] = useMemo(
    () =>
      allZones.exile.map((card) => {
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
      }),
    [allZones.exile, state],
  );

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
  const battlefieldArrows = useMemo(
    () =>
      (allBattlefieldArrows ?? []).filter(
        (arrow) => arrow.playerId === localPlayerId,
      ),
    [allBattlefieldArrows, localPlayerId],
  );
  const provisionalArrow =
    pendingArrowStart && pendingArrowEnd
      ? { start: pendingArrowStart, end: pendingArrowEnd }
      : null;
  const hiddenBattlefieldCardIds = useMemo(
    () =>
      new Set(activeDrag?.origin === "battlefield" ? activeDrag.cardIds : []),
    [activeDrag],
  );
  const selectedBattlefieldCardIdSet = useMemo(
    () => new Set(selectedBattlefieldCardIds),
    [selectedBattlefieldCardIds],
  );
  const hiddenHandCardId =
    activeDrag?.origin === "library" ? activeDrag.cardId : null;

  const handlePingCard = useCallback(
    (cardId: string) => dispatch({ type: "card/ping", cardId }),
    [dispatch],
  );

  const [battlefieldContainerEl, setBattlefieldContainerEl] =
    useState<HTMLDivElement | null>(null);

  const setBattlefieldRefs = useCallback(
    (node: HTMLDivElement | null) => {
      battlefieldRef.current = node;
      battlefieldContainerElRef.current = node;
      battlefieldDrop.setNodeRef(node);
      setBattlefieldContainerEl(node);
    },
    [battlefieldDrop],
  );

  const setHandRefs = useCallback(
    (node: HTMLDivElement | null) => {
      handRef.current = node;
      handDrop.setNodeRef(node);
    },
    [handDrop],
  );

  const setGraveyardRefs = useCallback(
    (node: HTMLDivElement | null) => {
      graveyardRef.current = node;
      graveyardDrop.setNodeRef(node);
    },
    [graveyardDrop],
  );

  const setExileRefs = useCallback(
    (node: HTMLDivElement | null) => {
      exileRef.current = node;
      exileDrop.setNodeRef(node);
    },
    [exileDrop],
  );

  const setLibraryTopRefs = useCallback(
    (node: HTMLDivElement | null) => {
      libraryTopRef.current = node;
      libraryTopDrop.setNodeRef(node);
    },
    [libraryTopDrop],
  );

  const setLibraryBottomRefs = useCallback(
    (node: HTMLDivElement | null) => {
      libraryBottomRef.current = node;
      libraryBottomDrop.setNodeRef(node);
    },
    [libraryBottomDrop],
  );

  const openGraveyardPreview = useCallback(
    () => setZonePreview("graveyard"),
    [],
  );
  const openExilePreview = useCallback(() => setZonePreview("exile"), []);
  const closeZonePreview = useCallback(() => setZonePreview(null), []);
  const closeCardMenu = useCallback(() => setCardMenu(null), []);
  const closeBattlefieldContextMenu = useCallback(
    () => setBattlefieldContextMenu(null),
    [],
  );
  const openTokenBrowser = useCallback(() => setTokenBrowserOpen(true), []);
  const closeTokenBrowser = useCallback(() => setTokenBrowserOpen(false), []);

  const graveyardCount = zoneCount("graveyard");
  const exileCount = zoneCount("exile");
  const libraryCount = zoneCount("library");

  const handleProfilerRender = useCallback(
    (
      id: string,
      phase: "mount" | "update" | "nested-update",
      actualDuration: number,
    ) => {
      if (process.env.NODE_ENV !== "development") return;
      if (actualDuration < 16) return;

      console.info(`[profile] ${id} ${phase}: ${actualDuration.toFixed(1)}ms`);
    },
    [],
  );

  const handleBattlefieldSelectionChange = useCallback((cardIds: string[]) => {
    setSelectedBattlefieldCardIds(cardIds);
    setFocusedBattlefieldCardId(cardIds.at(-1) ?? null);
  }, []);

  const handleHoverWithAnchor = useCallback(
    (info: CardHoverInfo | null, target: HTMLElement | null) => {
      if (!info || !target) {
        hoverPreviewRef.current?.clear();
        return;
      }

      hoverPreviewRef.current?.show(info, target);
    },
    [],
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

  const handleRightClickCard = useCallback(
    (cardId: string, x: number, y: number) => {
      setCardMenu({ cardId, x, y });
    },
    [],
  );

  const handleEmptyBattlefieldRightClick = useCallback(
    (x: number, y: number) => {
      battlefieldContextPositionRef.current = { x, y };
      setBattlefieldContextMenu({ x, y });
    },
    [],
  );

  const handleCreateTokenFromBrowser = useCallback(
    (token: TokenCard, quantity: number) => {
      const { x: originX, y: originY } = battlefieldContextPositionRef.current;
      const bfRect = battlefieldRef.current?.getBoundingClientRect();

      const baseX = bfRect
        ? snapToGrid(
            Math.max(
              0,
              (originX - bfRect.left) / battlefieldZoom -
                BATTLEFIELD_CARD_WIDTH / 2,
            ),
          )
        : 80;
      const baseY = bfRect
        ? snapToGrid(
            Math.max(
              0,
              (originY - bfRect.top) / battlefieldZoom -
                BATTLEFIELD_CARD_HEIGHT / 2,
            ),
          )
        : 80;

      const SPREAD = GRID_SIZE * 2; // offset between copies

      for (let i = 0; i < quantity; i++) {
        const newDefId = generateCardDefId();
        const newInstId = generateCardInstanceId();

        const newDef = {
          id: newDefId,
          sourceId: token.scryfallId,
          name: token.name,
          imageUrl: token.imagePath,
          manaCost: token.manaCost ?? "",
          type: token.typeLine ?? "Token",
          oracleText: token.oracleText ?? null,
          power: token.power,
          toughness: token.toughness,
        };

        const col = i % 4;
        const row = Math.floor(i / 4);

        const newInst: CardInstance = {
          id: newInstId,
          definitionId: newDefId,
          ownerId: localPlayerId,
          controllerId: localPlayerId,
          zone: "battlefield",
          tapped: false,
          faceDown: false,
          counters:
            token.loyalty !== null
              ? { loyalty: parseInt(token.loyalty, 10) || 0 }
              : {},
          isToken: true,
          customName: null,
          tokenData: {
            name: token.name,
            power: token.power,
            toughness: token.toughness,
            color: token.colors[0] ?? null,
            type: token.typeLine ?? "Token",
            imageUrl: token.imagePath,
          },
          battlefield: {
            x: baseX + col * SPREAD,
            y: baseY + row * SPREAD,
            z: getNextBattlefieldZ(),
            attachedTo: null,
            attachments: [],
          },
        };

        dispatch({
          type: "token/create",
          playerId: localPlayerId,
          definition: newDef,
          instance: newInst,
        });
      }

      const label =
        quantity === 1 ? "1 token criado" : `${quantity} tokens criados`;
      setCenterToast({ id: crypto.randomUUID(), message: label });
    },
    [battlefieldZoom, dispatch, getNextBattlefieldZ, localPlayerId],
  );

  const handleAddCounter = useCallback(
    (cardId: string, counter: string) => {
      dispatch({ type: "card/addCounter", cardId, counter, amount: 1 });
    },
    [dispatch],
  );

  const handleRemoveCounter = useCallback(
    (cardId: string, counter: string) => {
      dispatch({ type: "card/removeCounter", cardId, counter, amount: 1 });
    },
    [dispatch],
  );

  const handleDuplicateAsToken = useCallback(
    (cardId: string) => {
      const source = state.cardInstances[cardId];
      if (!source) return;
      const sourceDef = state.cardDefinitions[source.definitionId];
      if (!sourceDef) return;

      const newDefId = generateCardDefId();
      const newInstId = generateCardInstanceId();

      const newDef = { ...sourceDef, id: newDefId };
      const newInst: CardInstance = {
        id: newInstId,
        definitionId: newDefId,
        ownerId: localPlayerId,
        controllerId: localPlayerId,
        zone: "battlefield",
        tapped: false,
        faceDown: false,
        counters: {},
        isToken: true,
        customName: source.customName,
        tokenData: source.tokenData ?? {
          name: sourceDef.name,
          power: sourceDef.power,
          toughness: sourceDef.toughness,
          color: null,
          type: sourceDef.type,
          imageUrl: sourceDef.imageUrl,
        },
        battlefield: {
          x: (source.battlefield?.x ?? 80) + 24,
          y: (source.battlefield?.y ?? 80) + 24,
          z: getNextBattlefieldZ(),
          attachedTo: null,
          attachments: [],
        },
      };

      dispatch({
        type: "token/duplicateFromCard",
        sourceCardId: cardId,
        newDefinition: newDef,
        newInstance: newInst,
      });
    },
    [
      dispatch,
      getNextBattlefieldZ,
      localPlayerId,
      state.cardDefinitions,
      state.cardInstances,
    ],
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

  const handleModifyCardPT = useCallback(
    (cardId: string, powerDelta: number, toughnessDelta: number) => {
      const inst = state.cardInstances[cardId];
      if (!inst) return;
      const def = state.cardDefinitions[inst.definitionId];
      if (!def) return;
      const rawPower = def.power ?? inst.tokenData?.power ?? "0";
      const rawToughness = def.toughness ?? inst.tokenData?.toughness ?? "0";
      const currentPower = parseInt(rawPower, 10);
      const currentToughness = parseInt(rawToughness, 10);
      dispatch({
        type: "card/setPowerToughness",
        cardId,
        defId: inst.definitionId,
        power: Number.isNaN(currentPower)
          ? rawPower
          : String(currentPower + powerDelta),
        toughness: Number.isNaN(currentToughness)
          ? rawToughness
          : String(currentToughness + toughnessDelta),
      });
    },
    [dispatch, state.cardDefinitions, state.cardInstances],
  );

  const handleModifyCardLoyalty = useCallback(
    (cardId: string, delta: number) => {
      const inst = state.cardInstances[cardId];
      if (!inst) return;
      const current = inst.counters.loyalty ?? 0;
      dispatch({
        type: "card/setCounter",
        cardId,
        counter: "loyalty",
        value: Math.max(0, current + delta),
      });
    },
    [dispatch, state.cardInstances],
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Profiler id="PlaymatDndTree" onRender={handleProfilerRender}>
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
              <Profiler id="BattlefieldArea" onRender={handleProfilerRender}>
                <BattlefieldArea
                  setRefs={setBattlefieldRefs}
                  isActiveDropTarget={battlefieldDrop.isOver}
                  isAnyDragActive={isAnyDragActive}
                  interactive={true}
                  isActiveTurn={activePlayerId === localPlayerId}
                  isRollingForFirstTurn={isRollingForFirstTurn}
                  orientation="bottom"
                  playerName={playerName}
                  life={life}
                  turnLabel={turnLabel}
                  battlefieldZoom={battlefieldZoom}
                  battlefieldCards={battlefieldCards}
                  activePings={activePings}
                  selectedCardIds={selectedBattlefieldCardIdSet}
                  hiddenCardIds={hiddenBattlefieldCardIds}
                  onWheel={handleBattlefieldWheel}
                  onChangeLife={handleChangeLife}
                  onAdjustZoom={adjustBattlefieldZoom}
                  onSelectCard={handleSelectBattlefieldCard}
                  onClearSelection={handleClearBattlefieldSelection}
                  onSelectionChange={handleBattlefieldSelectionChange}
                  onHoverCard={handleBattlefieldHover}
                  onPingCard={handlePingCard}
                  onModifyCardPT={handleModifyCardPT}
                  onModifyCardLoyalty={handleModifyCardLoyalty}
                  onRightClickCard={handleRightClickCard}
                  onEmptyRightClick={handleEmptyBattlefieldRightClick}
                  pan={battlefieldPan}
                  onPan={setBattlefieldPan}
                />
              </Profiler>
            </div>

            <BattlefieldArrowOverlay
              arrows={battlefieldArrows}
              provisionalArrow={provisionalArrow}
              isDrawing={isArrowMode || Boolean(pendingArrowStart)}
              interactive
              onPointerMove={handleArrowPointerMove}
              onCanvasClick={handleArrowCanvasClick}
              onDeleteArrow={handleDeleteArrow}
              containerEl={arrowContainerEl ?? battlefieldContainerEl}
              pan={battlefieldPan}
              zoom={battlefieldZoom}
              coordinateSpace={arrowCoordinateSpace}
            />

            <div
              id="player-side-zone"
              className="flex flex-row items-stretch justify-end gap-4 -mb-4 relative z-10 pr-3"
            >
              <Profiler id="HandZone" onRender={handleProfilerRender}>
                <HandZone
                  setRefs={setHandRefs}
                  isActiveDropTarget={handDrop.isOver}
                  isAnyDragActive={isAnyDragActive}
                  hiddenCardId={hiddenHandCardId}
                  handCards={handCards}
                  onHoverCard={handleHandHover}
                />
              </Profiler>

              <Profiler id="SideZonePanel" onRender={handleProfilerRender}>
                <SideZonePanel
                  graveyardTop={graveyardTop}
                  graveyardTopName={graveyardTopInfo?.name ?? "Carta"}
                  graveyardTopImageUrl={graveyardTopInfo?.imageUrl ?? null}
                  graveyardCount={graveyardCount}
                  graveyardIsOver={graveyardDrop.isOver}
                  setGraveyardRef={setGraveyardRefs}
                  onViewGraveyard={openGraveyardPreview}
                  onHoverGraveyardTop={handleHoverWithAnchor}
                  exileTop={exileTop}
                  exileTopName={exileTopInfo?.name ?? "Carta"}
                  exileTopImageUrl={exileTopInfo?.imageUrl ?? null}
                  exileCount={exileCount}
                  exileIsOver={exileDrop.isOver}
                  setExileRef={setExileRefs}
                  onViewExile={openExilePreview}
                  onHoverExileTop={handleHoverWithAnchor}
                  libraryTopId={libraryTop?.id ?? null}
                  libraryCount={libraryCount}
                  libraryTopIsOver={libraryTopDrop.isOver}
                  libraryBottomIsOver={libraryBottomDrop.isOver}
                  setLibraryTopRef={setLibraryTopRefs}
                  setLibraryBottomRef={setLibraryBottomRefs}
                  isAnyDragActive={isAnyDragActive}
                  onDraw={handleDraw}
                />
              </Profiler>
            </div>
          </section>

          <Profiler id="ZonePreviewModal" onRender={handleProfilerRender}>
            <ZonePreviewModal
              zone={zonePreview}
              cards={
                zonePreview === "graveyard"
                  ? graveyardPreviewCards
                  : exilePreviewCards
              }
              onClose={closeZonePreview}
              onHoverCard={handleHoverWithAnchor}
            />
          </Profiler>

          <DragOverlay zIndex={400} dropAnimation={null}>
            {activeDragCard &&
            (activeDrag?.origin === "battlefield" ||
              activeDrag?.origin === "library" ||
              activeDrag?.origin === "graveyard" ||
              activeDrag?.origin === "exile") ? (
              <div
                className="relative"
                style={{
                  width: `${BATTLEFIELD_CARD_WIDTH + 24}px`,
                  height: `${BATTLEFIELD_CARD_HEIGHT + 24}px`,
                }}
              >
                {activeDragCards.slice(0, 3).map((card, index) => (
                  <div
                    key={card.instance.id}
                    className="absolute overflow-hidden rounded-[4px] shadow-2xl ring-1 ring-white/15"
                    style={{
                      width: `${BATTLEFIELD_CARD_WIDTH}px`,
                      height: `${BATTLEFIELD_CARD_HEIGHT}px`,
                      left: `${index * 12}px`,
                      top: `${index * 8}px`,
                      zIndex: index + 1,
                    }}
                  >
                    {card.definition.imageUrl ? (
                      <Image
                        src={card.definition.imageUrl}
                        alt={card.definition.name}
                        width={BATTLEFIELD_CARD_WIDTH}
                        height={BATTLEFIELD_CARD_HEIGHT}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <CardBack className="h-full w-full" />
                    )}
                  </div>
                ))}

                {activeDragCards.length > 1 ? (
                  <div className="absolute right-0 top-0 z-10 flex min-w-8 items-center justify-center rounded-full border border-white/10 bg-black/85 px-2 py-1 text-xs font-bold text-white shadow-lg">
                    {activeDragCards.length}
                  </div>
                ) : null}
              </div>
            ) : null}
          </DragOverlay>

          {activeDrag && (
            <div
              className="pointer-events-none fixed inset-0 z-[150]"
              aria-hidden="true"
            />
          )}
        </Profiler>
      </DndContext>

      <HoverPreviewHost ref={hoverPreviewRef} gap={28} />

      {cardMenu &&
        (() => {
          const inst = state.cardInstances[cardMenu.cardId];
          const def = inst ? state.cardDefinitions[inst.definitionId] : null;
          if (!inst || !def) return null;
          return (
            <BattlefieldCardMenu
              cardId={cardMenu.cardId}
              cardName={inst.customName ?? inst.tokenData?.name ?? def.name}
              counters={inst.counters}
              x={cardMenu.x}
              y={cardMenu.y}
              onClose={closeCardMenu}
              onAddCounter={(counter) =>
                handleAddCounter(cardMenu.cardId, counter)
              }
              onRemoveCounter={(counter) =>
                handleRemoveCounter(cardMenu.cardId, counter)
              }
              onDuplicate={() => handleDuplicateAsToken(cardMenu.cardId)}
            />
          );
        })()}

      {battlefieldContextMenu && (
        <BattlefieldContextMenu
          x={battlefieldContextMenu.x}
          y={battlefieldContextMenu.y}
          onClose={closeBattlefieldContextMenu}
          onCreateToken={openTokenBrowser}
        />
      )}

      {tokenBrowserOpen && (
        <BattlefieldTokenBrowser
          onClose={closeTokenBrowser}
          onCreateToken={handleCreateTokenFromBrowser}
        />
      )}

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
    </>
  );
}
