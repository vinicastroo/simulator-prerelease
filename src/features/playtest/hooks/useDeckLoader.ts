"use client";

import { useState, useCallback } from "react";
import { loadDeckFromUrl, getDefaultDeckUrl } from "@/lib/mtg/deck-loader";
import type { GameAction } from "@/lib/game/actions";
import type { Dispatch } from "react";

type DeckLoaderState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; deckName?: string };

export function useDeckLoader(
  playerId: string,
  dispatch: Dispatch<GameAction>,
) {
  const [loaderState, setLoaderState] = useState<DeckLoaderState>({
    status: "idle",
  });

  const loadDeck = useCallback(
    async (url: string) => {
      setLoaderState({ status: "loading" });
      const result = await loadDeckFromUrl(url, playerId);

      if (!result.ok) {
        setLoaderState({ status: "error", message: result.error });
        return;
      }

      dispatch({
        type: "game/loadDeck",
        playerId,
        definitions: result.deck.definitions,
        instances: result.deck.instances,
      });
      // TODO: broadcast

      setLoaderState({ status: "loaded", deckName: result.name });
    },
    [playerId, dispatch],
  );

  const loadDefault = useCallback(async () => {
    const url = getDefaultDeckUrl();
    if (!url) {
      setLoaderState({
        status: "error",
        message: "Nenhum deck padrão configurado.",
      });
      return;
    }
    await loadDeck(url);
  }, [loadDeck]);

  return { loaderState, loadDeck, loadDefault };
}
