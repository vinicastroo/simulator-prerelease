"use client";

import { useTransition } from "react";

export function NewRoomButton({
  createRoom,
  className,
}: {
  createRoom: () => Promise<void>;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => createRoom())}
      disabled={isPending}
      className={
        className ??
        "rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.08] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {isPending ? "Criando..." : "+ Nova sala"}
    </button>
  );
}
