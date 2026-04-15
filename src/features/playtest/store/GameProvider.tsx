"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";
import type { GameAction } from "@/lib/game/actions";
import {
  canRedo,
  canUndo,
  createHistory,
  type GameHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from "@/lib/game/history";
import { generatePlayerId } from "@/lib/game/ids";
import { createInitialGameState } from "@/lib/game/initial-state";
import { gameReducer } from "@/lib/game/reducer";
import type { CardDefinition, CardInstance, GameState } from "@/lib/game/types";

// ─── Context types ────────────────────────────────────────────────────────────

export type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  localPlayerId: string;
  /** Card IDs that received a remote ping (opponent clicked) */
  activePings: Set<string>;
};

export const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

type GameProviderProps = {
  children: ReactNode;
  playerName?: string;
  /** Pre-loaded deck data from the DB. If provided, deck is dispatched on init. */
  initialDeck?: {
    definitions: CardDefinition[];
    instances: CardInstance[];
  };
};

export function GameProvider({
  children,
  playerName = "Você",
  initialDeck,
}: GameProviderProps) {
  const localPlayerIdRef = useRef(generatePlayerId());
  const localPlayerId = localPlayerIdRef.current;

  const baseState = createInitialGameState([
    { id: localPlayerId, name: playerName },
  ]);

  // Apply the deck immediately into the initial state (no dispatch needed)
  const initialState: GameState = initialDeck
    ? (() => {
        const defs = Object.fromEntries(
          initialDeck.definitions.map((d) => [d.id, d]),
        );
        const normalizedInstances = initialDeck.instances.map((i) => ({
          ...i,
          ownerId: localPlayerId,
          controllerId: localPlayerId,
        }));
        const insts = Object.fromEntries(
          normalizedInstances.map((i) => [i.id, i]),
        );
        const libraryIds = normalizedInstances
          .filter((i) => i.zone === "library")
          .map((i) => i.id);
        const sideboardIds = normalizedInstances
          .filter((i) => i.zone === "sideboard")
          .map((i) => i.id);
        return {
          ...baseState,
          cardDefinitions: defs,
          cardInstances: insts,
          players: {
            ...baseState.players,
            [localPlayerId]: {
              ...baseState.players[localPlayerId],
              zones: {
                ...baseState.players[localPlayerId].zones,
                library: libraryIds,
                sideboard: sideboardIds,
              },
            },
          },
        };
      })()
    : baseState;

  const [history, setHistory] = useReducer(
    (
      prev: GameHistory,
      action: GameAction | { type: "__undo" } | { type: "__redo" },
    ) => {
      if (action.type === "__undo") return undoHistory(prev);
      if (action.type === "__redo") return redoHistory(prev);
      const next = gameReducer(prev.present, action as GameAction);
      return pushHistory(prev, next);
    },
    createHistory(initialState),
  );

  const dispatch = useCallback((action: GameAction) => {
    setHistory(action);
  }, []);

  const undo = useCallback(() => setHistory({ type: "__undo" }), []);
  const redo = useCallback(() => setHistory({ type: "__redo" }), []);

  return (
    <GameContext.Provider
      value={{
        state: history.present,
        dispatch,
        undo,
        redo,
        canUndo: canUndo(history),
        canRedo: canRedo(history),
        localPlayerId,
        activePings: new Set<string>(),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx)
    throw new Error("useGameContext must be used inside <GameProvider>");
  return ctx;
}
