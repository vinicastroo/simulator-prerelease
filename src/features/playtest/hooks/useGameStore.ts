"use client";

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
    canUndo,
    canRedo,
    localPlayerId,
    activePings,
  } = useGameContext();

  const player = selectPlayer(state, localPlayerId);
  const activePlayer = selectActivePlayer(state);
  const allZones = selectAllCardsByZone(state, localPlayerId);
  const battlefieldLands = selectBattlefieldLands(state, localPlayerId);
  const battlefieldNonLands = selectBattlefieldNonLands(state, localPlayerId);

  function zoneCount(zone: ZoneName) {
    return selectZoneCount(state, localPlayerId, zone);
  }

  function cardWithDef(cardId: string) {
    return selectCardWithDefinition(state, cardId);
  }

  function cardName(cardId: string) {
    return selectCardName(state, cardId);
  }

  return {
    state,
    dispatch,
    undo,
    redo,
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
  };
}
