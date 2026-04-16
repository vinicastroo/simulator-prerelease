"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DECKS_QUERY_KEY } from "./DecksClient";
import type { DeckListItem } from "./DecksClient";

export function DeleteDeckButton({ deckId }: { deckId: string }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/deck/${deckId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir deck");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: DECKS_QUERY_KEY });
      const previous = queryClient.getQueryData<DeckListItem[]>(DECKS_QUERY_KEY);
      queryClient.setQueryData<DeckListItem[]>(DECKS_QUERY_KEY, (old = []) =>
        old.filter((kit) => kit.id !== deckId),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(DECKS_QUERY_KEY, context.previous);
      }
      setConfirming(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEY });
    },
  });

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={mutation.isPending}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/5 hover:text-white/70 disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {mutation.isPending ? "Excluindo…" : "Confirmar"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex h-8 w-8 items-center justify-center rounded-full text-white/25 transition hover:bg-red-500/15 hover:text-red-400"
      title="Excluir deck"
    >
      <Trash2 size={15} />
    </button>
  );
}
