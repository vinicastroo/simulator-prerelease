"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import {
  addBasicLandsToKit as serverAddBasicLandsToKit,
  setDeckZone as serverSetDeckZone,
  updateCardPosition,
  updateMultiplePositions,
} from "@/actions/cards";

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
    setName?: string | null;
    colors: string[];
    manaCost?: string | null;
    cmc: number;
    typeLine: string;
    oracleText?: string | null;
    flavorText?: string | null;
    power?: string | null;
    toughness?: string | null;
    loyalty?: string | null;
    artist?: string | null;
    releasedAt?: string | null;
    imagePath: string;
    collectorNumber: string;
    rawData?: unknown;
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

type AddCardsAction = {
  type: "ADD_CARDS";
  cards: PlacedCardState[];
};

type OptimisticAction =
  | MoveAction
  | MoveManyAction
  | SetDeckZoneAction
  | AddCardsAction;

function applyOptimistic(
  state: PlacedCardState[],
  action: OptimisticAction,
): PlacedCardState[] {
  if (action.type === "MOVE") {
    return state.map((c) =>
      c.id === action.id
        ? { ...c, posX: action.posX, posY: action.posY, zIndex: action.zIndex }
        : c,
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
    return state.map((c) =>
      idSet.has(c.id) ? { ...c, isMainDeck: action.zone } : c,
    );
  }
  if (action.type === "ADD_CARDS") {
    return [...state, ...action.cards];
  }
  return state;
}

// ─── Context shape ────────────────────────────────────────────────────────────

type PrereleaseContextValue = {
  cards: PlacedCardState[];
  isPending: boolean;
  kitId: string;
  moveCard: (id: string, posX: number, posY: number, zIndex: number) => void;
  moveCards: (updates: PositionUpdatePayload[]) => void;
  setDeckZone: (ids: string[], zone: boolean | null) => void;
  addBasicLandsToKit: (
    landName: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest",
    quantity: number,
  ) => Promise<void>;
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
  const [optimisticCards, dispatch] = useOptimistic(
    initialCards,
    applyOptimistic,
  );
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
    [dispatch, kitId],
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
    [dispatch, kitId],
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
    [dispatch, kitId],
  );

  const addBasicLandsToKit = useCallback(
    (
      landName: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest",
      quantity: number,
    ): Promise<void> => {
      return new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            const createdCards = await serverAddBasicLandsToKit(
              kitId,
              landName,
              quantity,
              true,
            );
            const optimisticCards: PlacedCardState[] = createdCards.map(
              (created) => ({
                id: created.id,
                cardId: created.cardId,
                posX: created.posX,
                posY: created.posY,
                zIndex: created.zIndex,
                isMainDeck: created.isMainDeck,
                isFoil: created.isFoil,
                isPromo: false,
                card: {
                  id: created.card.id,
                  name: created.card.name,
                  rarity: created.card.rarity,
                  set: created.card.set,
                  setName: created.card.setName,
                  colors: Array.isArray(created.card.colors)
                    ? (created.card.colors as string[])
                    : [],
                  manaCost: created.card.manaCost,
                  cmc: created.card.cmc,
                  typeLine: created.card.typeLine,
                  oracleText: created.card.oracleText,
                  flavorText: created.card.flavorText,
                  power: created.card.power,
                  toughness: created.card.toughness,
                  loyalty: created.card.loyalty,
                  artist: created.card.artist,
                  releasedAt: created.card.releasedAt,
                  imagePath: created.card.imagePath,
                  collectorNumber: created.card.collectorNumber,
                  rawData: created.card.rawData,
                },
              }),
            );

            dispatch({ type: "ADD_CARDS", cards: optimisticCards });
          } catch (err) {
            console.error("Falha ao adicionar terrenos básicos:", err);
          } finally {
            resolve();
          }
        });
      });
    },
    [dispatch, kitId],
  );

  const contextValue = useMemo(
    () => ({
      cards: optimisticCards,
      isPending,
      kitId,
      moveCard,
      moveCards,
      setDeckZone,
      addBasicLandsToKit,
      draggingCardId,
      setDraggingCard,
    }),
    [
      optimisticCards,
      isPending,
      kitId,
      moveCard,
      moveCards,
      setDeckZone,
      addBasicLandsToKit,
      draggingCardId,
    ],
  );

  return (
    <PrereleaseContext.Provider value={contextValue}>
      {children}
    </PrereleaseContext.Provider>
  );
}

export function usePrerelease() {
  const ctx = useContext(PrereleaseContext);
  if (!ctx)
    throw new Error("usePrerelease must be used inside PrereleaseProvider");
  return ctx;
}
