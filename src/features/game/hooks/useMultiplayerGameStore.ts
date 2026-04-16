"use client";

import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import {
  selectActivePlayer,
  selectAllCardsByZone,
  selectBattlefieldLands,
  selectBattlefieldNonLands,
  selectCardName,
  selectCardWithDefinition,
  selectPlayer,
  selectZoneCount,
} from "@/lib/game/selectors";
import type { ZoneName } from "@/lib/game/types";
import { useMultiplayerGameStoreApi } from "../store/MultiplayerGameProvider";

export function useMultiplayerGameStore() {
  const store = useMultiplayerGameStoreApi();

  // Static props — read directly, never trigger re-renders since they never change.
  const localPlayerId = store.getState().localPlayerId;
  const opponentPlayerId = store.getState().opponentPlayerId;
  const roomId = store.getState().roomId;
  const myRole = store.getState().myRole;
  const myUserId = store.getState().myUserId;

  // Granular reactive subscriptions — each re-renders the component only when
  // its specific slice changes.
  const gameState = useStore(store, (s) => s.gameState);
  const stateVersion = useStore(store, (s) => s.stateVersion);
  const isConnected = useStore(store, (s) => s.isConnected);
  const activePings = useStore(store, (s) => s.activePings);
  const hostResetAccepted = useStore(store, (s) => s.hostResetAccepted);
  const guestResetAccepted = useStore(store, (s) => s.guestResetAccepted);
  const isResetPending = useStore(store, (s) => s.isResetPending);
  const resetSyncVersion = useStore(store, (s) => s.resetSyncVersion);
  const isFirstPlayerRollActive = useStore(
    store,
    (s) => s.isFirstPlayerRollActive,
  );
  const firstPlayerRollWinnerId = useStore(
    store,
    (s) => s.firstPlayerRollWinnerId,
  );
  const pendingActionCount = useStore(store, (s) => s.pendingActionCount);
  const mulliganToastMessage = useStore(store, (s) => s.mulliganToastMessage);
  const opponentShuffleCount = useStore(store, (s) => s.opponentShuffleCount);

  // Stable action references from the store.
  const dispatch = useStore(store, (s) => s.dispatch);
  const requestReset = useStore(store, (s) => s.requestReset);
  const cancelReset = useStore(store, (s) => s.cancelReset);
  const keepOpeningHand = useStore(store, (s) => s.keepOpeningHand);

  // Derived selectors — memoized so they don't recompute on unrelated renders.
  const player = useMemo(
    () => selectPlayer(gameState, localPlayerId),
    [gameState, localPlayerId],
  );
  const activePlayer = useMemo(
    () => selectActivePlayer(gameState),
    [gameState],
  );
  const allZones = useMemo(
    () => selectAllCardsByZone(gameState, localPlayerId),
    [gameState, localPlayerId],
  );
  const battlefieldLands = useMemo(
    () => selectBattlefieldLands(gameState, localPlayerId),
    [gameState, localPlayerId],
  );
  const battlefieldNonLands = useMemo(
    () => selectBattlefieldNonLands(gameState, localPlayerId),
    [gameState, localPlayerId],
  );

  const zoneCount = useCallback(
    (zone: ZoneName) => selectZoneCount(gameState, localPlayerId, zone),
    [gameState, localPlayerId],
  );
  const cardWithDef = useCallback(
    (cardId: string) => selectCardWithDefinition(gameState, cardId),
    [gameState],
  );
  const cardName = useCallback(
    (cardId: string) => selectCardName(gameState, cardId),
    [gameState],
  );

  return {
    state: gameState,
    dispatch,
    // Undo/redo are no-ops in multiplayer.
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,
    localPlayerId,
    opponentPlayerId,
    roomId,
    myRole,
    myUserId,
    isConnected,
    activePings,
    hostResetAccepted,
    guestResetAccepted,
    isResetPending,
    stateVersion,
    resetSyncVersion,
    isFirstPlayerRollActive,
    firstPlayerRollWinnerId,
    isActionPending: pendingActionCount > 0,
    mulliganToastMessage,
    opponentShuffleCount,
    requestReset,
    cancelReset,
    keepOpeningHand,
    player,
    activePlayer,
    allZones,
    battlefieldLands,
    battlefieldNonLands,
    zoneCount,
    cardWithDef,
    cardName,
  };
}
