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
import { useMultiplayerGameContext } from "../store/MultiplayerGameProvider";

export function useMultiplayerGameStore() {
  const {
    state,
    dispatch,
    localPlayerId,
    opponentPlayerId,
    roomId,
    isConnected,
    myRole,
  } = useMultiplayerGameContext();

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
    // Undo/redo are no-ops in multiplayer
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,
    localPlayerId,
    opponentPlayerId,
    player,
    activePlayer,
    allZones,
    battlefieldLands,
    battlefieldNonLands,
    zoneCount,
    cardWithDef,
    cardName,
    // Multiplayer-specific extras
    roomId,
    isConnected,
    myRole,
  };
}
