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
import type { GameState } from "@/lib/game/types";
import { getPusherClient } from "@/lib/pusher-client";

// ─── Context types ────────────────────────────────────────────────────────────

type MultiplayerGameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  localPlayerId: string;
  opponentPlayerId: string;
  roomId: string;
  isConnected: boolean;
  myRole: "host" | "guest";
  myUserId: string;
  activePings: Set<string>;
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
}: MultiplayerGameProviderProps) {
  const [state, setState] = useReducer(
    (_prev: GameState, next: GameState) => next,
    initialGameState,
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const versionRef = useRef(initialStateVersion);

  const [isConnected, setIsConnected] = useReducer(
    (_: boolean, next: boolean) => next,
    false,
  );

  const [activePings, setActivePings] = useState<Set<string>>(new Set());

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

  // Serialized action queue — prevents VERSION_CONFLICT when actions fire rapidly
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
          const data = (await res.json()) as { seq: number };
          versionRef.current = data.seq;
        } else {
          // Resync on any error (version conflict, etc.)
          const sync = await fetch(`/api/game/${roomId}/state`);
          if (sync.ok) {
            const data = (await sync.json()) as {
              gameState: GameState;
              stateVersion: number;
            };
            setState(data.gameState);
            versionRef.current = data.stateVersion;
          }
        }
      } catch {
        // Network error — keep going, state already applied optimistically
      }

      actionQueueRef.current.shift();
    }

    processingRef.current = false;
  }, [roomId]);

  const dispatch = useCallback(
    (action: GameAction) => {
      // Apply optimistically immediately
      setState(gameReducer(stateRef.current, action));
      // Enqueue and drain serially so versions never conflict
      actionQueueRef.current.push(action);
      void processQueue();
    },
    [processQueue],
  );

  // Pusher subscription
  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(`game-${roomId}`);

    channel.bind("pusher:subscription_succeeded", () => setIsConnected(true));
    channel.bind("pusher:subscription_error", () => setIsConnected(false));

    channel.bind(
      "game-action",
      (data: { action: GameAction; actorUserId: string }) => {
        // Ignore echo of own actions (already applied optimistically)
        if (data.actorUserId === myUserId) return;
        // card/ping is a UI signal — show animation, don't mutate state
        if (data.action.type === "card/ping") {
          addPing(data.action.cardId);
          return;
        }
        setState(gameReducer(stateRef.current, data.action));
      },
    );

    channel.bind(
      "state-sync",
      (data: { gameState: GameState; stateVersion: number }) => {
        setState(data.gameState);
        if (data.stateVersion !== undefined)
          versionRef.current = data.stateVersion;
      },
    );

    setIsConnected(true);

    // Reconnect → resync
    client.connection.bind("connected", () => {
      setIsConnected(true);
      void fetch(`/api/game/${roomId}/state`).then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as {
            gameState: GameState;
            stateVersion: number;
          };
          setState(data.gameState);
          versionRef.current = data.stateVersion;
        }
      });
    });

    client.connection.bind("disconnected", () => setIsConnected(false));

    return () => {
      channel.unbind_all();
      client.unsubscribe(`game-${roomId}`);
    };
  }, [roomId, myUserId, addPing]);

  return (
    <MultiplayerGameContext.Provider
      value={{
        state,
        dispatch,
        localPlayerId,
        opponentPlayerId,
        roomId,
        isConnected,
        myRole,
        myUserId,
        activePings,
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
