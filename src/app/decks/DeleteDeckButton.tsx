"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/deck/${deckId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/5 hover:text-white/70"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Excluindo…" : "Confirmar"}
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
