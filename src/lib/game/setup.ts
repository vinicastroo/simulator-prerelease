import type { GameSetupState, GameState, PlayerId } from "./types";

export function createInitialGameSetup(): GameSetupState {
  return {
    mulligan: {
      stage: "mulligan",
      keptPlayerIds: [],
      handSizeByPlayerId: {},
      mulliganCountByPlayerId: {},
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

export function getPlayerMulliganCount(
  state: GameState,
  playerId: PlayerId,
): number {
  return getGameSetup(state).mulligan.mulliganCountByPlayerId[playerId] ?? 0;
}
