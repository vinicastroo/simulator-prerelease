import type { GameSetupState, GameState, PlayerId } from "./types";

export function createInitialGameSetup(): GameSetupState {
  return {
    mulligan: {
      stage: "mulligan",
      keptPlayerIds: [],
    },
  };
}

export function getGameSetup(state: GameState): GameSetupState {
  return state.setup ?? createInitialGameSetup();
}

export function withGameSetup(
  state: GameState,
  setup: GameSetupState,
): GameState {
  return { ...state, setup };
}

export function hasPlayerKeptOpeningHand(
  state: GameState,
  playerId: PlayerId,
): boolean {
  return getGameSetup(state).mulligan.keptPlayerIds.includes(playerId);
}
