import type { GameState, PlayerState, PlayerId } from "./types";
import { generateGameId } from "./ids";

const ALL_ZONES = [
  "library",
  "hand",
  "battlefield",
  "graveyard",
  "exile",
  "sideboard",
  "command",
] as const;

function createPlayerState(id: PlayerId, name: string): PlayerState {
  return {
    id,
    name,
    life: 20,
    lifeHistory: [],
    counters: {
      poison: 0,
      energy: 0,
      experience: 0,
      storm: 0,
      custom: {},
    },
    manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    zones: {
      library: [],
      hand: [],
      battlefield: [],
      graveyard: [],
      exile: [],
      sideboard: [],
      command: [],
    },
  };
}

export function createInitialGameState(
  players: { id: PlayerId; name: string }[],
): GameState {
  const playerOrder = players.map((p) => p.id);
  const activePlayerId = playerOrder[0] ?? "";

  return {
    id: generateGameId(),
    createdAt: Date.now(),
    players: Object.fromEntries(
      players.map((p) => [p.id, createPlayerState(p.id, p.name)]),
    ),
    playerOrder,
    activePlayerId,
    priorityPlayerId: activePlayerId,
    turnNumber: 1,
    phase: "main1",
    cardDefinitions: {},
    cardInstances: {},
    log: [],
  };
}
