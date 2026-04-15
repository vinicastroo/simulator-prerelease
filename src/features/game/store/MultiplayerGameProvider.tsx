"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
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
};

const MultiplayerGameContext =
  createContext<MultiplayerGameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

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
  const [state, setState] = useReducer(
    (_prev: GameState, next: GameState) => next,
    initialGameState,
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const versionRef = useRef(initialStateVersion);
  const [stateVersion, setStateVersion] = useState(initialStateVersion);

  const [isConnected, setIsConnected] = useReducer(
    (_: boolean, next: boolean) => next,
    false,
  );

  const [activePings, setActivePings] = useState<Set<string>>(new Set());
  const [hostResetAccepted, setHostResetAccepted] = useState(
    initialHostResetAccepted,
  );
  const [guestResetAccepted, setGuestResetAccepted] = useState(
    initialGuestResetAccepted,
  );
  const [isResetPending, setIsResetPending] = useState(false);
  const [resetSyncVersion, setResetSyncVersion] = useState(0);
  const [isFirstPlayerRollActive, setIsFirstPlayerRollActive] = useState(false);
  const [firstPlayerRollWinnerId, setFirstPlayerRollWinnerId] = useState<
    string | null
  >(null);
  const [pendingActionCount, setPendingActionCount] = useState(0);
  const [mulliganToastMessage, setMulliganToastMessage] = useState<
    string | null
  >(null);

  const addPing = useCallback((cardId: string) => {
    setActivePings((prev) => new Set([...prev, cardId]));
    setTimeout(() => {
      setActivePings((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }, 700);
  }, []);

  // Serialized action queue — server stays authoritative for multiplayer actions.
  const actionQueueRef = useRef<GameAction[]>([]);
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (actionQueueRef.current.length > 0) {
      const action = actionQueueRef.current[0];
      if (!action) break;
      const sentVersion = versionRef.current;

      try {
        const res = await fetch(`/api/game/${roomId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, stateVersion: sentVersion }),
        });

        if (res.ok) {
          // State already applied optimistically in dispatch — just update version.
          const data = (await res.json()) as { seq: number };
          versionRef.current = data.seq;
          setStateVersion(data.seq);
        } else {
          // Resync on any error (version conflict, etc.)
          const sync = await fetch(`/api/game/${roomId}/state`);
          if (sync.ok) {
            const data = (await sync.json()) as {
              gameState: GameState;
              stateVersion: number;
              hostReady: boolean;
              guestReady: boolean;
            };
            stateRef.current = data.gameState;
            setState(data.gameState);
            versionRef.current = data.stateVersion;
            setStateVersion(data.stateVersion);
            setHostResetAccepted(Boolean(data.hostReady));
            setGuestResetAccepted(Boolean(data.guestReady));
          }
        }
      } catch {
        // Network error — keep going, state already applied optimistically
      }

      actionQueueRef.current.shift();
      setPendingActionCount((current) => Math.max(0, current - 1));
    }

    processingRef.current = false;
  }, [roomId]);

  const resyncState = useCallback(async () => {
    const res = await fetch(`/api/game/${roomId}/state`);
    if (!res.ok) return;

    const data = (await res.json()) as {
      gameState: GameState;
      stateVersion: number;
      hostReady: boolean;
      guestReady: boolean;
    };

    actionQueueRef.current = [];
    processingRef.current = false;
    stateRef.current = data.gameState;
    setState(data.gameState);
    versionRef.current = data.stateVersion;
    setStateVersion(data.stateVersion);
    setHostResetAccepted(Boolean(data.hostReady));
    setGuestResetAccepted(Boolean(data.guestReady));
  }, [roomId]);

  const dispatch = useCallback(
    (action: GameAction) => {
      // Apply immediately (optimistic) — same reducer the server uses.
      const nextState = gameReducer(stateRef.current, action);
      stateRef.current = nextState;
      setState(nextState);

      actionQueueRef.current.push(action);
      setPendingActionCount((current) => current + 1);
      void processQueue();
    },
    [processQueue],
  );

  const requestReset = useCallback(async () => {
    setIsResetPending(true);

    try {
      const res = await fetch(`/api/game/${roomId}/reset`, {
        method: "POST",
      });

      if (!res.ok) {
        return;
      }
    } finally {
      setIsResetPending(false);
    }
  }, [roomId]);

  const cancelReset = useCallback(async () => {
    await fetch(`/api/game/${roomId}/reset`, { method: "DELETE" });
  }, [roomId]);

  const keepOpeningHand = useCallback(async () => {
    await fetch(`/api/game/${roomId}/keep-hand`, {
      method: "POST",
    });
  }, [roomId]);

  // Pusher subscription
  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(`game-${roomId}`);

    channel.bind("pusher:subscription_succeeded", () => setIsConnected(true));
    channel.bind("pusher:subscription_error", () => setIsConnected(false));

    channel.bind(
      "game-action",
      (data: { action: GameAction; actorUserId: string; seq?: number }) => {
        // Ignore echo of own actions (already applied optimistically)
        if (data.actorUserId === myUserId) return;
        // card/ping is a UI signal — show animation, don't mutate state
        if (data.action.type === "card/ping") {
          addPing(data.action.cardId);
          return;
        }
        const nextState = gameReducer(stateRef.current, data.action);
        stateRef.current = nextState;
        setState(nextState);
        if (data.seq !== undefined) {
          versionRef.current = data.seq;
          setStateVersion(data.seq);
        }
      },
    );

    channel.bind("state-updated", () => {
      void resyncState().then(() => {
        if (getGameSetup(stateRef.current).mulligan.stage === "mulligan") {
          setIsFirstPlayerRollActive(false);
          setFirstPlayerRollWinnerId(null);
        }
        setResetSyncVersion((current) => current + 1);
      });
    });

    channel.bind(
      "first-player-roll-started",
      (data: { winnerId: string; durationMs: number }) => {
        setFirstPlayerRollWinnerId(data.winnerId);
        setIsFirstPlayerRollActive(true);
        window.setTimeout(() => {
          setIsFirstPlayerRollActive(false);
        }, data.durationMs);
      },
    );

    channel.bind(
      "player-mulliganed",
      (data: { playerName: string; count: number }) => {
        setMulliganToastMessage(
          `${data.playerName} mulligou ${data.count} vez${data.count === 1 ? "" : "es"}`,
        );
        window.setTimeout(() => {
          setMulliganToastMessage((current) =>
            current ===
            `${data.playerName} mulligou ${data.count} vez${data.count === 1 ? "" : "es"}`
              ? null
              : current,
          );
        }, 2200);
      },
    );

    channel.bind(
      "reset-vote-updated",
      (data: { hostReady: boolean; guestReady: boolean }) => {
        setHostResetAccepted(data.hostReady);
        setGuestResetAccepted(data.guestReady);
      },
    );

    setIsConnected(true);

    // Reconnect → resync
    client.connection.bind("connected", () => {
      setIsConnected(true);
      void resyncState();
    });

    client.connection.bind("disconnected", () => setIsConnected(false));

    return () => {
      channel.unbind_all();
      client.unsubscribe(`game-${roomId}`);
    };
  }, [roomId, myUserId, addPing, resyncState]);

  return (
    <MultiplayerGameContext.Provider
      value={{
        state,
        dispatch,
        requestReset,
        cancelReset,
        keepOpeningHand,
        localPlayerId,
        opponentPlayerId,
        roomId,
        isConnected,
        myRole,
        myUserId,
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
      }}
    >
      {children}
    </MultiplayerGameContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMultiplayerGameContext(): MultiplayerGameContextValue {
  const ctx = useContext(MultiplayerGameContext);
  if (!ctx)
    throw new Error(
      "useMultiplayerGameContext must be used inside <MultiplayerGameProvider>",
    );
  return ctx;
}
