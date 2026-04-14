import type {
  GameState,
  PlayerId,
  CardInstanceId,
  ZoneName,
  CardInstance,
  CardDefinition,
} from "./types";

export function selectPlayer(state: GameState, playerId: PlayerId) {
  return state.players[playerId] ?? null;
}

export function selectCardInstance(
  state: GameState,
  cardId: CardInstanceId,
): CardInstance | null {
  return state.cardInstances[cardId] ?? null;
}

export function selectCardDefinition(
  state: GameState,
  defId: string,
): CardDefinition | null {
  return state.cardDefinitions[defId] ?? null;
}

export function selectCardWithDefinition(
  state: GameState,
  cardId: CardInstanceId,
): { instance: CardInstance; definition: CardDefinition } | null {
  const instance = state.cardInstances[cardId];
  if (!instance) return null;
  const definition = state.cardDefinitions[instance.definitionId];
  if (!definition) return null;
  return { instance, definition };
}

export function selectZoneCards(
  state: GameState,
  playerId: PlayerId,
  zone: ZoneName,
): CardInstance[] {
  const player = state.players[playerId];
  if (!player) return [];
  return player.zones[zone]
    .map((id) => state.cardInstances[id])
    .filter((c): c is CardInstance => c !== undefined);
}

export function selectZoneCount(
  state: GameState,
  playerId: PlayerId,
  zone: ZoneName,
): number {
  return state.players[playerId]?.zones[zone].length ?? 0;
}

export function selectBattlefieldLands(
  state: GameState,
  playerId: PlayerId,
): CardInstance[] {
  return selectZoneCards(state, playerId, "battlefield").filter((c) => {
    const def = state.cardDefinitions[c.definitionId];
    return def?.type.toLowerCase().includes("land") ?? false;
  });
}

export function selectBattlefieldNonLands(
  state: GameState,
  playerId: PlayerId,
): CardInstance[] {
  return selectZoneCards(state, playerId, "battlefield").filter((c) => {
    const def = state.cardDefinitions[c.definitionId];
    return !(def?.type.toLowerCase().includes("land") ?? false);
  });
}

export function selectTopLibraryCards(
  state: GameState,
  playerId: PlayerId,
  count: number,
): CardInstance[] {
  const player = state.players[playerId];
  if (!player) return [];
  return player.zones.library
    .slice(0, count)
    .map((id) => state.cardInstances[id])
    .filter((c): c is CardInstance => c !== undefined);
}

export function selectActivePlayer(state: GameState) {
  return state.players[state.activePlayerId] ?? null;
}

export function selectPriorityPlayer(state: GameState) {
  return state.players[state.priorityPlayerId] ?? null;
}

export function selectAllCardsByZone(
  state: GameState,
  playerId: PlayerId,
): Record<ZoneName, CardInstance[]> {
  const player = state.players[playerId];
  if (!player) {
    return {
      library: [],
      hand: [],
      battlefield: [],
      graveyard: [],
      exile: [],
      sideboard: [],
      command: [],
    };
  }

  const zones: ZoneName[] = [
    "library",
    "hand",
    "battlefield",
    "graveyard",
    "exile",
    "sideboard",
    "command",
  ];

  return Object.fromEntries(
    zones.map((z) => [
      z,
      player.zones[z]
        .map((id) => state.cardInstances[id])
        .filter((c): c is CardInstance => c !== undefined),
    ]),
  ) as Record<ZoneName, CardInstance[]>;
}

export function selectCardName(
  state: GameState,
  cardId: CardInstanceId,
): string {
  const inst = state.cardInstances[cardId];
  if (!inst) return "Unknown";
  if (inst.customName) return inst.customName;
  if (inst.isToken && inst.tokenData) return inst.tokenData.name;
  return state.cardDefinitions[inst.definitionId]?.name ?? "Unknown";
}
