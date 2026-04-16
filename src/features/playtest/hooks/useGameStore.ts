"use client";

import { useCallback, useMemo } from "react";
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
import { useGameContext } from "../store/GameProvider";

export function useGameStore() {
  const {
    state,
    dispatch,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    localPlayerId,
    activePings,
  } = useGameContext();

  const player = useMemo(
    () => selectPlayer(state, localPlayerId),
    [state, localPlayerId],
  );
  const activePlayer = useMemo(() => selectActivePlayer(state), [state]);
  const allZones = useMemo(
    () => selectAllCardsByZone(state, localPlayerId),
    [state, localPlayerId],
  );
  const battlefieldLands = useMemo(
    () => selectBattlefieldLands(state, localPlayerId),
    [state, localPlayerId],
  );
  const battlefieldNonLands = useMemo(
    () => selectBattlefieldNonLands(state, localPlayerId),
    [state, localPlayerId],
  );

  const zoneCount = useCallback(
    (zone: ZoneName) => selectZoneCount(state, localPlayerId, zone),
    [state, localPlayerId],
  );

  const cardWithDef = useCallback(
    (cardId: string) => selectCardWithDefinition(state, cardId),
    [state],
  );

  const cardName = useCallback(
    (cardId: string) => selectCardName(state, cardId),
    [state],
  );

  return useMemo(
    () => ({
      state,
      dispatch,
      undo,
      redo,
      reset,
      canUndo,
      canRedo,
      localPlayerId,
      player,
      activePlayer,
      allZones,
      battlefieldLands,
      battlefieldNonLands,
      zoneCount,
      cardWithDef,
      cardName,
      activePings,
    }),
    [
      state,
      dispatch,
      undo,
      redo,
      reset,
      canUndo,
      canRedo,
      localPlayerId,
      player,
      activePlayer,
      allZones,
      battlefieldLands,
      battlefieldNonLands,
      zoneCount,
      cardWithDef,
      cardName,
      activePings,
    ],
  );
}
