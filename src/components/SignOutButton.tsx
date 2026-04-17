"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        setIsPending(true);
        await signOut({ callbackUrl: "/login" });
      }}
      disabled={isPending}
      className="rounded-full  bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 border-none hover:text-white"
    >
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
