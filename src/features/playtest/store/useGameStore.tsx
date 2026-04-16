"use client";

import {
  createContext,
  type Dispatch,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
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
import type {
  CardDefinition,
  CardInstance,
  GameState,
  ZoneName,
} from "@/lib/game/types";

// ─── Legacy context types (kept here for MultiplayerPlaymat compatibility) ────
//
// MultiplayerPlaymat creates a GameContextValue to bridge multiplayer state
// into the solo Playmat. These exports replace the ones that lived in
// GameProvider.tsx.

export type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  localPlayerId: string;
  activePings: Set<string>;
};

export const GameContext = createContext<GameContextValue | null>(null);

// ─── Store shape ──────────────────────────────────────────────────────────────

type GameStoreSlice = {
  gameState: GameState;
  history: GameHistory;
  localPlayerId: string;
  activePings: Set<string>;
  _initialGameState: GameState;
  dispatch: (action: GameAction) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  _addPing: (cardId: string) => void;
};

// ─── Initial state builder ────────────────────────────────────────────────────

function buildInitialGameState(
  localPlayerId: string,
  playerName: string,
  initialDeck?: { definitions: CardDefinition[]; instances: CardInstance[] },
): GameState {
  const base = createInitialGameState([
    { id: localPlayerId, name: playerName },
  ]);
  if (!initialDeck) return base;

  const defs = Object.fromEntries(
    initialDeck.definitions.map((d) => [d.id, d]),
  );
  const normalizedInstances = initialDeck.instances.map((i) => ({
    ...i,
    ownerId: localPlayerId,
    controllerId: localPlayerId,
  }));
  const insts = Object.fromEntries(normalizedInstances.map((i) => [i.id, i]));
  const libraryIds = normalizedInstances
    .filter((i) => i.zone === "library")
    .map((i) => i.id);
  const sideboardIds = normalizedInstances
    .filter((i) => i.zone === "sideboard")
    .map((i) => i.id);

  return {
    ...base,
    cardDefinitions: defs,
    cardInstances: insts,
    players: {
      ...base.players,
      [localPlayerId]: {
        ...base.players[localPlayerId],
        zones: {
          ...base.players[localPlayerId].zones,
          library: libraryIds,
          sideboard: sideboardIds,
        },
      },
    },
  };
}

// ─── Store factory ────────────────────────────────────────────────────────────

export type GameStoreApi = ReturnType<typeof createGameStore>;

export function createGameStore(
  playerName = "Você",
  initialDeck?: { definitions: CardDefinition[]; instances: CardInstance[] },
) {
  const localPlayerId = generatePlayerId();
  const initialGameState = buildInitialGameState(
    localPlayerId,
    playerName,
    initialDeck,
  );
  const initialHistory = createHistory(initialGameState);

  return createStore<GameStoreSlice>()(
    subscribeWithSelector((set, get) => ({
      gameState: initialGameState,
      history: initialHistory,
      localPlayerId,
      activePings: new Set<string>(),
      _initialGameState: initialGameState,

      dispatch: (action: GameAction) => {
        const { history } = get();
        const nextState = gameReducer(history.present, action);
        const nextHistory = pushHistory(history, nextState);
        set({ gameState: nextState, history: nextHistory });
      },

      undo: () => {
        const { history } = get();
        if (!canUndo(history)) return;
        const nextHistory = undoHistory(history);
        set({ gameState: nextHistory.present, history: nextHistory });
      },

      redo: () => {
        const { history } = get();
        if (!canRedo(history)) return;
        const nextHistory = redoHistory(history);
        set({ gameState: nextHistory.present, history: nextHistory });
      },

      reset: () => {
        const nextHistory = createHistory(get()._initialGameState);
        set({ gameState: get()._initialGameState, history: nextHistory });
      },

      _addPing: (cardId: string) => {
        set((s) => ({ activePings: new Set([...s.activePings, cardId]) }));
        setTimeout(() => {
          set((s) => {
            const next = new Set(s.activePings);
            next.delete(cardId);
            return { activePings: next };
          });
        }, 700);
      },
    })),
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const GameStoreContext = createContext<GameStoreApi | null>(null);

type GameStoreProviderProps = {
  children: React.ReactNode;
  playerName?: string;
  initialDeck?: { definitions: CardDefinition[]; instances: CardInstance[] };
};

export function GameStoreProvider({
  children,
  playerName = "Você",
  initialDeck,
}: GameStoreProviderProps) {
  const storeRef = useRef<GameStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createGameStore(playerName, initialDeck);
  }
  return (
    <GameStoreContext.Provider value={storeRef.current}>
      {children}
    </GameStoreContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// Module-level fallback store used only to satisfy hook call-order rules when
// GameContext is the active source (multiplayer bridge mode). Its state is
// never read for rendering in that case.
const _fallbackStore = createGameStore();

export function useGameStore() {
  const store = useContext(GameStoreContext);
  const legacyCtx = useContext(GameContext);

  if (!store && !legacyCtx) {
    throw new Error("useGameStore must be used inside <GameStoreProvider>");
  }

  // Always call useStore (hook rules). When store is null, _fallbackStore is
  // used just to satisfy the call but its values are overridden below.
  const activeStore = store ?? _fallbackStore;
  const gameState = useStore(activeStore, (s) => s.gameState);
  const history = useStore(activeStore, (s) => s.history);
  const zustandLocalPlayerId = useStore(activeStore, (s) => s.localPlayerId);
  const zustandActivePings = useStore(activeStore, (s) => s.activePings);
  const zustandDispatch = useStore(activeStore, (s) => s.dispatch);
  const zustandUndo = useStore(activeStore, (s) => s.undo);
  const zustandRedo = useStore(activeStore, (s) => s.redo);
  const zustandReset = useStore(activeStore, (s) => s.reset);

  // Resolve effective values — Zustand store wins; GameContext is fallback for
  // the multiplayer bridge (MultiplayerPlaymat provides GameContext but not
  // GameStoreContext). When store is null, legacyCtx is guaranteed non-null
  // (checked above), so `?? zustand*` branches are unreachable dead code kept
  // only to satisfy the type checker.
  const state = store ? gameState : (legacyCtx?.state ?? gameState);
  const localPlayerId = store
    ? zustandLocalPlayerId
    : (legacyCtx?.localPlayerId ?? zustandLocalPlayerId);
  const activePings = store
    ? zustandActivePings
    : (legacyCtx?.activePings ?? zustandActivePings);
  const dispatch = store
    ? zustandDispatch
    : (legacyCtx?.dispatch ?? zustandDispatch);
  const undo = store ? zustandUndo : (legacyCtx?.undo ?? zustandUndo);
  const redo = store ? zustandRedo : (legacyCtx?.redo ?? zustandRedo);
  const reset = store ? zustandReset : (legacyCtx?.reset ?? zustandReset);
  const effectiveCanUndo = store
    ? canUndo(history)
    : (legacyCtx?.canUndo ?? canUndo(history));
  const effectiveCanRedo = store
    ? canRedo(history)
    : (legacyCtx?.canRedo ?? canRedo(history));

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
      canUndo: effectiveCanUndo,
      canRedo: effectiveCanRedo,
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
      effectiveCanUndo,
      effectiveCanRedo,
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
