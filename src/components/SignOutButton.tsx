"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setIsPending(true);
        await signOut({ callbackUrl: "/login" });
      }}
      disabled={isPending}
      className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 transition hover:bg-white/[0.1] disabled:cursor-wait disabled:opacity-60"
    >
      {isPending ? "Saindo..." : "Sair"}
    </button>
  );
}
