import type { GameState } from "./types";

const MAX_HISTORY = 50;

export type GameHistory = {
  past: GameState[];
  present: GameState;
  future: GameState[];
};

export function createHistory(initialState: GameState): GameHistory {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

export function pushHistory(
  history: GameHistory,
  newState: GameState,
): GameHistory {
  const past = [...history.past, history.present].slice(-MAX_HISTORY);
  return {
    past,
    present: newState,
    future: [],
  };
}

export function undoHistory(history: GameHistory): GameHistory {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  const past = history.past.slice(0, -1);
  return {
    past,
    present: previous,
    future: [history.present, ...history.future].slice(0, MAX_HISTORY),
  };
}

export function redoHistory(history: GameHistory): GameHistory {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  const future = history.future.slice(1);
  return {
    past: [...history.past, history.present].slice(-MAX_HISTORY),
    present: next,
    future,
  };
}

export function canUndo(history: GameHistory): boolean {
  return history.past.length > 0;
}

export function canRedo(history: GameHistory): boolean {
  return history.future.length > 0;
}
