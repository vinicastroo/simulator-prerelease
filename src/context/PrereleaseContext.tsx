"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { updateCardPosition, updateMultiplePositions, setDeckZone as serverSetDeckZone } from "@/actions/cards";

export type PlacedCardState = {
  id: string;
  cardId: string;
  posX: number;
  posY: number;
  zIndex: number;
  isMainDeck: boolean | null; // null = canvas only (unassigned)
  isFoil: boolean;
  isPromo: boolean;
  card: {
    id: string;
    name: string;
    rarity: string;
    set: string;
    colors: string[];
    cmc: number;
    typeLine: string;
    imagePath: string;
    collectorNumber: string;
  };
};

export type PositionUpdatePayload = {
  id: string;
  posX: number;
  posY: number;
  zIndex: number;
};

// ─── Optimistic actions ───────────────────────────────────────────────────────

type MoveAction = {
  type: "MOVE";
  id: string;
  posX: number;
  posY: number;
  zIndex: number;
};

type MoveManyAction = {
  type: "MOVE_MANY";
  updates: PositionUpdatePayload[];
};

type SetDeckZoneAction = {
  type: "SET_DECK_ZONE";
  ids: string[];
  zone: boolean | null;
};

type OptimisticAction = MoveAction | MoveManyAction | SetDeckZoneAction;

function applyOptimistic(
  state: PlacedCardState[],
  action: OptimisticAction
): PlacedCardState[] {
  if (action.type === "MOVE") {
    return state.map((c) =>
      c.id === action.id
        ? { ...c, posX: action.posX, posY: action.posY, zIndex: action.zIndex }
        : c
    );
  }
  if (action.type === "MOVE_MANY") {
    const map = new Map(action.updates.map((u) => [u.id, u]));
    return state.map((c) => {
      const u = map.get(c.id);
      return u ? { ...c, posX: u.posX, posY: u.posY, zIndex: u.zIndex } : c;
    });
  }
  if (action.type === "SET_DECK_ZONE") {
    const idSet = new Set(action.ids);
    return state.map((c) => (idSet.has(c.id) ? { ...c, isMainDeck: action.zone } : c));
  }
  return state;
}

// ─── Context shape ────────────────────────────────────────────────────────────

type PrereleaseContextValue = {
  cards: PlacedCardState[];
  isPending: boolean;
  kitId: string;
  // Canvas position persistence
  moveCard: (id: string, posX: number, posY: number, zIndex: number) => void;
  moveCards: (updates: PositionUpdatePayload[]) => void;
  // Deck zone assignment
  setDeckZone: (ids: string[], zone: boolean | null) => void;
  // Drag state (shared with Sidebar for drop-zone UI)
  draggingCardId: string | null;
  setDraggingCard: (id: string | null) => void;
};

const PrereleaseContext = createContext<PrereleaseContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PrereleaseProvider({
  children,
  initialCards,
  kitId,
}: {
  children: ReactNode;
  initialCards: PlacedCardState[];
  kitId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCards, dispatch] = useOptimistic(initialCards, applyOptimistic);
  const [draggingCardId, setDraggingCard] = useState<string | null>(null);

  const moveCard = useCallback(
    (id: string, posX: number, posY: number, zIndex: number) => {
      startTransition(async () => {
        dispatch({ type: "MOVE", id, posX, posY, zIndex });
        try {
          await updateCardPosition(id, posX, posY, zIndex, kitId);
        } catch (err) {
          console.error("Falha ao sincronizar posição:", err);
        }
      });
    },
    [dispatch, kitId]
  );

  const moveCards = useCallback(
    (updates: PositionUpdatePayload[]) => {
      startTransition(async () => {
        dispatch({ type: "MOVE_MANY", updates });
        try {
          await updateMultiplePositions(updates, kitId);
        } catch (err) {
          console.error("Falha ao sincronizar posições do grupo:", err);
        }
      });
    },
    [dispatch, kitId]
  );

  const setDeckZone = useCallback(
    (ids: string[], zone: boolean | null) => {
      startTransition(async () => {
        dispatch({ type: "SET_DECK_ZONE", ids, zone });
        try {
          await serverSetDeckZone(ids, zone, kitId);
        } catch (err) {
          console.error("Falha ao atribuir zona do deck:", err);
        }
      });
    },
    [dispatch, kitId]
  );

  const contextValue = useMemo(
    () => ({
      cards: optimisticCards,
      isPending,
      kitId,
      moveCard,
      moveCards,
      setDeckZone,
      draggingCardId,
      setDraggingCard,
    }),
    [optimisticCards, isPending, kitId, moveCard, moveCards, setDeckZone, draggingCardId]
  );

  return (
    <PrereleaseContext.Provider value={contextValue}>
      {children}
    </PrereleaseContext.Provider>
  );
}

export function usePrerelease() {
  const ctx = useContext(PrereleaseContext);
  if (!ctx) throw new Error("usePrerelease must be used inside PrereleaseProvider");
  return ctx;
}
