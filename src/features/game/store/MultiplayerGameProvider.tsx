"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { GameAction } from "@/lib/game/actions";
import { gameReducer } from "@/lib/game/reducer";
import { getGameSetup } from "@/lib/game/setup";
import type { GameState } from "@/lib/game/types";
import { getPusherClient } from "@/lib/pusher-client";

// ─── Context types ────────────────────────────────────────────────────────────

type MultiplayerGameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  requestReset: () => Promise<void>;
  cancelReset: () => Promise<void>;
  keepOpeningHand: () => Promise<void>;
  localPlayerId: string;
  opponentPlayerId: string;
  roomId: string;
  isConnected: boolean;
  myRole: "host" | "guest";
  myUserId: string;
  activePings: Set<string>;
  hostResetAccepted: boolean;
  guestResetAccepted: boolean;
  isResetPending: boolean;
  stateVersion: number;
  resetSyncVersion: number;
  isFirstPlayerRollActive: boolean;
  firstPlayerRollWinnerId: string | null;
  isActionPending: boolean;
  mulliganToastMessage: string | null;
  opponentShuffleCount: number;
};

// ─── Store shape ──────────────────────────────────────────────────────────────

type MultiplayerGameStoreSlice = {
  gameState: GameState;
  stateVersion: number;
  isConnected: boolean;
  activePings: Set<string>;
  hostResetAccepted: boolean;
  guestResetAccepted: boolean;
  isResetPending: boolean;
  resetSyncVersion: number;
  isFirstPlayerRollActive: boolean;
  firstPlayerRollWinnerId: string | null;
  pendingActionCount: number;
  // Actions dispatched locally but not yet committed to the server.
  // Rebased on top of fresh server state whenever a resync happens so
  // concurrent actions from both players are never lost.
  pendingActions: GameAction[];
  mulliganToastMessage: string | null;
  opponentShuffleCount: number;
  localPlayerId: string;
  opponentPlayerId: string;
  roomId: string;
  myRole: "host" | "guest";
  myUserId: string;

  dispatch: (action: GameAction) => void;
  resyncState: () => Promise<void>;
  requestReset: () => Promise<void>;
  cancelReset: () => Promise<void>;
  keepOpeningHand: () => Promise<void>;
  addPing: (cardId: string) => void;
  setIsConnected: (connected: boolean) => void;
  triggerStateUpdated: () => Promise<void>;
  triggerFirstPlayerRoll: (winnerId: string, durationMs: number) => void;
  triggerMulliganToast: (playerName: string, count: number) => void;
  updateResetVote: (hostReady: boolean, guestReady: boolean) => void;
};

export type MultiplayerGameStoreApi = ReturnType<
  typeof createMultiplayerGameStore
>;

// ─── Store factory ────────────────────────────────────────────────────────────

type MultiplayerGameStoreInit = {
  initialGameState: GameState;
  initialStateVersion: number;
  localPlayerId: string;
  opponentPlayerId: string;
  roomId: string;
  myRole: "host" | "guest";
  myUserId: string;
  initialHostResetAccepted: boolean;
  initialGuestResetAccepted: boolean;
};

function createMultiplayerGameStore({
  initialGameState,
  initialStateVersion,
  localPlayerId,
  opponentPlayerId,
  roomId,
  myRole,
  myUserId,
  initialHostResetAccepted,
  initialGuestResetAccepted,
}: MultiplayerGameStoreInit) {
  // Closure-based non-reactive bookkeeping — never trigger re-renders.
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isFlushing = false;
  let pendingFlush = false;
  // Incremented on every resync. Lets in-flight flushes detect they're stale.
  let syncGeneration = 0;
  // Debounce gate for resyncState — collapses event bursts into one GET.
  let resyncTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleFlusher = (
    get: () => MultiplayerGameStoreSlice,
    setStoreState: (partial: Partial<MultiplayerGameStoreSlice>) => void,
  ) => {
    // If a flush is already in-flight, mark that we need another flush after it
    // completes instead of scheduling a concurrent one with a stale stateVersion.
    if (isFlushing) {
      pendingFlush = true;
      return;
    }
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void flushState(get, setStoreState);
    }, 80);
  };

  const flushState = async (
    get: () => MultiplayerGameStoreSlice,
    setStoreState: (partial: Partial<MultiplayerGameStoreSlice>) => void,
  ) => {
    isFlushing = true;
    const generation = syncGeneration;
    const { gameState, stateVersion } = get();
    try {
      const res = await fetch(`/api/game/${roomId}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameState, stateVersion }),
      });
      // Discard result if a resync happened while this request was in-flight.
      if (generation !== syncGeneration) return;
      if (res.ok) {
        const data = (await res.json()) as { seq: number };
        setStoreState({ stateVersion: data.seq, pendingActionCount: 0, pendingActions: [] });
      } else if (res.status === 409) {
        await get().resyncState();
      } else {
        setStoreState({ pendingActionCount: 0 });
      }
    } catch {
      if (generation === syncGeneration) {
        setStoreState({ pendingActionCount: 0 });
      }
    } finally {
      isFlushing = false;
      if (pendingFlush && generation === syncGeneration) {
        pendingFlush = false;
        void flushState(get, setStoreState);
      } else {
        pendingFlush = false;
      }
    }
  };

  return createStore<MultiplayerGameStoreSlice>()(
    subscribeWithSelector((set, get) => {
      const setStoreState = (partial: Partial<MultiplayerGameStoreSlice>) => {
        set(partial);
      };

      return {
        gameState: initialGameState,
        stateVersion: initialStateVersion,
        isConnected: false,
        activePings: new Set<string>(),
        hostResetAccepted: initialHostResetAccepted,
        guestResetAccepted: initialGuestResetAccepted,
        isResetPending: false,
        resetSyncVersion: 0,
        isFirstPlayerRollActive: false,
        firstPlayerRollWinnerId: null,
        pendingActionCount: 0,
        pendingActions: [],
        mulliganToastMessage: null,
        opponentShuffleCount: 0,
        localPlayerId,
        opponentPlayerId,
        roomId,
        myRole,
        myUserId,

        dispatch: (action: GameAction) => {
          if (action.type === "card/ping") {
            void fetch(`/api/game/${roomId}/action`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action,
                stateVersion: get().stateVersion,
              }),
            }).catch(() => {});
            return;
          }

          const nextState = gameReducer(get().gameState, action);
          set({
            gameState: nextState,
            pendingActionCount: 1,
            pendingActions: [...get().pendingActions, action],
          });
          scheduleFlusher(get, setStoreState);
        },

        resyncState: async () => {
          // Collapse rapid bursts (e.g. two Pusher events from the same
          // triggerBatch) into a single GET instead of two back-to-back requests.
          if (resyncTimer !== null) return;
          resyncTimer = setTimeout(() => { resyncTimer = null; }, 0);

          syncGeneration++;
          pendingFlush = false;
          if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
          }
          const res = await fetch(`/api/game/${roomId}/state`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const data = (await res.json()) as {
            gameState: GameState;
            stateVersion: number;
            hostReady: boolean;
            guestReady: boolean;
          };
          // Re-apply any locally-pending actions on top of the authoritative
          // server state so concurrent changes from both players are preserved.
          const { pendingActions } = get();
          const rebasedState = pendingActions.reduce(
            (s, a) => gameReducer(s, a),
            data.gameState as GameState,
          );
          set({
            gameState: rebasedState,
            stateVersion: data.stateVersion,
            hostResetAccepted: Boolean(data.hostReady),
            guestResetAccepted: Boolean(data.guestReady),
            pendingActionCount: 0,
          });
          // If there are still pending local actions, schedule a flush so they
          // reach the server even though the debounce was just cancelled.
          if (pendingActions.length > 0) {
            scheduleFlusher(get, setStoreState);
          }
        },

        requestReset: async () => {
          set({ isResetPending: true });
          try {
            await fetch(`/api/game/${roomId}/reset`, { method: "POST" });
          } finally {
            set({ isResetPending: false });
          }
        },

        cancelReset: async () => {
          await fetch(`/api/game/${roomId}/reset`, { method: "DELETE" });
        },

        keepOpeningHand: async () => {
          await fetch(`/api/game/${roomId}/keep-hand`, { method: "POST" });
        },

        addPing: (cardId: string) => {
          set((s) => ({ activePings: new Set([...s.activePings, cardId]) }));
          setTimeout(() => {
            set((s) => {
              const next = new Set(s.activePings);
              next.delete(cardId);
              return { activePings: next };
            });
          }, 700);
        },

        setIsConnected: (connected: boolean) => set({ isConnected: connected }),

        triggerStateUpdated: async () => {
          await get().resyncState();
          if (getGameSetup(get().gameState).mulligan.stage === "mulligan") {
            set({
              isFirstPlayerRollActive: false,
              firstPlayerRollWinnerId: null,
            });
          }
          set((s) => ({ resetSyncVersion: s.resetSyncVersion + 1 }));
        },

        triggerFirstPlayerRoll: (winnerId: string, durationMs: number) => {
          set({
            firstPlayerRollWinnerId: winnerId,
            isFirstPlayerRollActive: true,
          });
          window.setTimeout(() => {
            set({ isFirstPlayerRollActive: false });
          }, durationMs);
        },

        triggerMulliganToast: (playerName: string, count: number) => {
          const message = `${playerName} mulligou ${count} vez${count === 1 ? "" : "es"}`;
          set({ mulliganToastMessage: message });
          window.setTimeout(() => {
            set((s) => ({
              mulliganToastMessage:
                s.mulliganToastMessage === message
                  ? null
                  : s.mulliganToastMessage,
            }));
          }, 2200);
        },

        updateResetVote: (hostReady: boolean, guestReady: boolean) => {
          set({ hostResetAccepted: hostReady, guestResetAccepted: guestReady });
        },
      };
    }),
  );
}

// ─── Context & Provider ───────────────────────────────────────────────────────

const MultiplayerGameStoreContext =
  createContext<MultiplayerGameStoreApi | null>(null);

type MultiplayerGameProviderProps = {
  children: ReactNode;
  roomId: string;
  initialGameState: GameState;
  initialStateVersion: number;
  localPlayerId: string;
  opponentPlayerId: string;
  myRole: "host" | "guest";
  myUserId: string;
  initialHostResetAccepted: boolean;
  initialGuestResetAccepted: boolean;
};

export function MultiplayerGameProvider({
  children,
  roomId,
  initialGameState,
  initialStateVersion,
  localPlayerId,
  opponentPlayerId,
  myRole,
  myUserId,
  initialHostResetAccepted,
  initialGuestResetAccepted,
}: MultiplayerGameProviderProps) {
  const storeRef = useRef<MultiplayerGameStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createMultiplayerGameStore({
      initialGameState,
      initialStateVersion,
      localPlayerId,
      opponentPlayerId,
      roomId,
      myRole,
      myUserId,
      initialHostResetAccepted,
      initialGuestResetAccepted,
    });
  }
  const store = storeRef.current;

  useEffect(() => {
    const {
      addPing,
      triggerStateUpdated,
      triggerFirstPlayerRoll,
      triggerMulliganToast,
      updateResetVote,
      resyncState,
      setIsConnected,
    } = store.getState();

    const client = getPusherClient();
    const channel = client.subscribe(`game-${roomId}`);

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
      void resyncState();
    });
    channel.bind("pusher:subscription_error", () => setIsConnected(false));

    channel.bind(
      "game-action",
      (data: { action: GameAction; actorUserId: string }) => {
        if (data.actorUserId === myUserId) return;
        if (data.action.type === "card/ping") {
          addPing(data.action.cardId);
        }
      },
    );

    channel.bind(
      "state-push",
      (data: { stateVersion: number; actorUserId: string }) => {
        if (data.actorUserId === myUserId) return;
        void resyncState();
      },
    );

    channel.bind("state-updated", () => {
      void triggerStateUpdated();
    });

    channel.bind(
      "first-player-roll-started",
      (data: { winnerId: string; durationMs: number }) => {
        triggerFirstPlayerRoll(data.winnerId, data.durationMs);
      },
    );

    channel.bind(
      "player-mulliganed",
      (data: { playerName: string; count: number }) => {
        triggerMulliganToast(data.playerName, data.count);
      },
    );

    channel.bind(
      "reset-vote-updated",
      (data: { hostReady: boolean; guestReady: boolean }) => {
        updateResetVote(data.hostReady, data.guestReady);
      },
    );

    setIsConnected(true);

    if (initialHostResetAccepted || initialGuestResetAccepted) {
      void resyncState();
    }

    const handleConnected = () => {
      setIsConnected(true);
      void resyncState();
    };
    const handleDisconnected = () => setIsConnected(false);

    client.connection.bind("connected", handleConnected);
    client.connection.bind("disconnected", handleDisconnected);

    return () => {
      channel.unbind_all();
      client.unsubscribe(`game-${roomId}`);
      client.connection.unbind("connected", handleConnected);
      client.connection.unbind("disconnected", handleDisconnected);
    };
  }, [
    store,
    roomId,
    myUserId,
    initialHostResetAccepted,
    initialGuestResetAccepted,
  ]);

  return (
    <MultiplayerGameStoreContext.Provider value={store}>
      {children}
    </MultiplayerGameStoreContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMultiplayerGameStoreApi(): MultiplayerGameStoreApi {
  const store = useContext(MultiplayerGameStoreContext);
  if (!store) {
    throw new Error(
      "useMultiplayerGameStoreApi must be used inside <MultiplayerGameProvider>",
    );
  }
  return store;
}

export function useMultiplayerGameContext(): MultiplayerGameContextValue {
  const store = useContext(MultiplayerGameStoreContext);
  if (!store) {
    throw new Error(
      "useMultiplayerGameContext must be used inside <MultiplayerGameProvider>",
    );
  }

  const gameState = useStore(store, (s) => s.gameState);
  const stateVersion = useStore(store, (s) => s.stateVersion);
  const isConnected = useStore(store, (s) => s.isConnected);
  const activePings = useStore(store, (s) => s.activePings);
  const hostResetAccepted = useStore(store, (s) => s.hostResetAccepted);
  const guestResetAccepted = useStore(store, (s) => s.guestResetAccepted);
  const isResetPending = useStore(store, (s) => s.isResetPending);
  const resetSyncVersion = useStore(store, (s) => s.resetSyncVersion);
  const isFirstPlayerRollActive = useStore(
    store,
    (s) => s.isFirstPlayerRollActive,
  );
  const firstPlayerRollWinnerId = useStore(
    store,
    (s) => s.firstPlayerRollWinnerId,
  );
  const pendingActionCount = useStore(store, (s) => s.pendingActionCount);
  const mulliganToastMessage = useStore(store, (s) => s.mulliganToastMessage);
  const opponentShuffleCount = useStore(store, (s) => s.opponentShuffleCount);
  const dispatch = useStore(store, (s) => s.dispatch);
  const requestReset = useStore(store, (s) => s.requestReset);
  const cancelReset = useStore(store, (s) => s.cancelReset);
  const keepOpeningHand = useStore(store, (s) => s.keepOpeningHand);

  return {
    state: gameState,
    dispatch,
    requestReset,
    cancelReset,
    keepOpeningHand,
    localPlayerId: store.getState().localPlayerId,
    opponentPlayerId: store.getState().opponentPlayerId,
    roomId: store.getState().roomId,
    myRole: store.getState().myRole,
    myUserId: store.getState().myUserId,
    isConnected,
    activePings,
    hostResetAccepted,
    guestResetAccepted,
    isResetPending,
    stateVersion,
    resetSyncVersion,
    isFirstPlayerRollActive,
    firstPlayerRollWinnerId,
    isActionPending: pendingActionCount > 0,
    mulliganToastMessage,
    opponentShuffleCount,
  };
}
