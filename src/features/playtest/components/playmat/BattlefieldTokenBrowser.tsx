"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type TokenCard = {
  id: string;
  scryfallId: string;
  name: string;
  typeLine: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  colors: string[];
  manaCost: string | null;
  oracleText: string | null;
  imagePath: string | null;
};

type BattlefieldTokenBrowserProps = {
  onClose: () => void;
  onCreateToken: (token: TokenCard, quantity: number) => void;
};

const COLOR_BORDER: Record<string, string> = {
  W: "border-yellow-100/50",
  U: "border-blue-400/50",
  B: "border-purple-400/50",
  R: "border-red-400/50",
  G: "border-green-400/50",
};

function tokenBorderClass(colors: string[]): string {
  if (colors.length === 0) return "border-white/15";
  if (colors.length > 1) return "border-yellow-400/50";
  return COLOR_BORDER[colors[0]] ?? "border-white/15";
}

export function BattlefieldTokenBrowser({
  onClose,
  onCreateToken,
}: BattlefieldTokenBrowserProps) {
  const [mounted, setMounted] = useState(false);
  const [tokens, setTokens] = useState<TokenCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((data: TokenCard[]) => {
        setTokens(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  const filtered = tokens.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const clampQuantity = (v: number) => Math.max(1, Math.min(99, v));

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onPointerDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0e1420]/97 shadow-[0_16px_60px_rgba(0,0,0,0.7)]"
        style={{ width: 480, height: 560 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
              Tokens
            </p>
            <p className="mt-0.5 text-xs text-white/50">
              Escolha um token para criar no campo de batalha
            </p>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Search + quantity */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar token..."
            autoFocus
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none"
          />

          {/* Quantity stepper */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-1 py-0.5">
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-90"
              onClick={() => setQuantity((q) => clampQuantity(q - 1))}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) =>
                setQuantity(clampQuantity(parseInt(e.target.value, 10) || 1))
              }
              className="w-8 bg-transparent text-center text-sm font-bold tabular-nums text-white focus:outline-none"
            />
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-90"
              onClick={() => setQuantity((q) => clampQuantity(q + 1))}
            >
              +
            </button>
          </div>
        </div>

        {/* Token grid */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loading ? (
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              Nenhum token encontrado
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 pt-2">
              {filtered.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  className={`group relative flex flex-col overflow-hidden rounded-lg border bg-white/[0.03] transition hover:bg-white/[0.08] hover:border-white/30 active:scale-95 ${tokenBorderClass(token.colors)}`}
                  onClick={() => {
                    onCreateToken(token, quantity);
                    onClose();
                  }}
                >
                  {token.imagePath ? (
                    <Image
                      src={token.imagePath}
                      alt={token.name}
                      width={96}
                      height={134}
                      className="h-[90px] w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[90px] w-full items-center justify-center bg-white/5 text-[9px] text-white/30">
                      sem imagem
                    </div>
                  )}
                  <div className="px-1.5 py-1">
                    <p className="truncate text-[9px] font-semibold leading-tight text-white">
                      {token.name}
                    </p>
                    {token.power !== null && token.toughness !== null && (
                      <p className="text-[8px] text-white/50">
                        {token.power}/{token.toughness}
                      </p>
                    )}
                    {token.loyalty !== null && (
                      <p className="text-[8px] text-amber-300/70">
                        L: {token.loyalty}
                      </p>
                    )}
                  </div>

                  {/* Quantity badge on hover */}
                  {quantity > 1 && (
                    <div className="pointer-events-none absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#91a7da] px-1 text-[9px] font-bold text-[#0e1420]">
                      ×{quantity}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-white/8 px-4 py-2 text-[10px] text-white/30">
          Clique em um token para criar{" "}
          {quantity === 1 ? "1 cópia" : `${quantity} cópias`} no campo de
          batalha
        </div>
      </div>
    </div>,
    document.body,
  );
}
