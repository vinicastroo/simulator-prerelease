"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

type Kit = {
  id: string;
  college: string;
  createdAt: Date;
  promoCard: { name: string } | null;
  _count: { placedCards: number };
};

export function NewGameForm({
  kits,
  createRoom,
}: {
  kits: Kit[];
  createRoom: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1017] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#91a7da]">
        Multiplayer
      </p>
      <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
        Nova partida
      </h1>
      <p className="mt-1 text-sm text-white/45">
        Crie uma sala e envie o link para seu oponente.
      </p>

      {kits.length === 0 && (
        <p className="mt-4 rounded-xl border border-yellow-800/40 bg-yellow-900/20 px-3 py-2 text-sm text-yellow-200/70">
          Você não tem nenhum kit. Crie um kit no simulador antes de jogar.
        </p>
      )}

      {kits.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-[11px] text-white/50">
            Você selecionará seu kit na sala após criar a partida.
          </p>
          <ul className="mt-2 space-y-1">
            {kits.slice(0, 3).map((kit) => (
              <li key={kit.id} className="text-xs text-white/70">
                {kit.college.charAt(0) + kit.college.slice(1).toLowerCase()} —{" "}
                {kit._count.placedCards} cartas
              </li>
            ))}
            {kits.length > 3 && (
              <li className="text-xs text-white/40">
                +{kits.length - 3} outros kits
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <Button
          type="button"
          className="w-full bg-[#4d6393] text-white hover:bg-[#5f77ab]"
          disabled={isPending || kits.length === 0}
          onClick={() => startTransition(() => createRoom())}
        >
          {isPending ? "Criando..." : "Criar sala"}
        </Button>
      </div>
    </div>
  );
}
