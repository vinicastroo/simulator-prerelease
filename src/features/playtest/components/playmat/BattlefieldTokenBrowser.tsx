"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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

type TokensResponse = {
  tokens: TokenCard[];
  total: number;
  page: number;
  totalPages: number;
};

type BattlefieldTokenBrowserProps = {
  onClose: () => void;
  onCreateToken: (token: TokenCard, quantity: number) => void;
  deckCardIds?: string[];
};

const COLOR_OPTIONS = [
  {
    code: "W",
    label: "W",
    bg: "bg-yellow-50",
    text: "text-yellow-900",
    border: "border-yellow-200/60",
    activeBg: "bg-yellow-100",
    activeBorder: "border-yellow-400",
  },
  {
    code: "U",
    label: "U",
    bg: "bg-blue-900/40",
    text: "text-blue-300",
    border: "border-blue-500/40",
    activeBg: "bg-blue-700/60",
    activeBorder: "border-blue-400",
  },
  {
    code: "B",
    label: "B",
    bg: "bg-purple-900/40",
    text: "text-purple-300",
    border: "border-purple-500/40",
    activeBg: "bg-purple-700/60",
    activeBorder: "border-purple-400",
  },
  {
    code: "R",
    label: "R",
    bg: "bg-red-900/40",
    text: "text-red-300",
    border: "border-red-500/40",
    activeBg: "bg-red-700/60",
    activeBorder: "border-red-400",
  },
  {
    code: "G",
    label: "G",
    bg: "bg-green-900/40",
    text: "text-green-300",
    border: "border-green-500/40",
    activeBg: "bg-green-700/60",
    activeBorder: "border-green-400",
  },
  {
    code: "C",
    label: "∅",
    bg: "bg-white/5",
    text: "text-white/50",
    border: "border-white/15",
    activeBg: "bg-white/15",
    activeBorder: "border-white/50",
  },
] as const;

const SUBTYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "creature", label: "Criatura" },
  { value: "artifact", label: "Artefato" },
  { value: "enchantment", label: "Encantamento" },
  { value: "emblem", label: "Emblema" },
] as const;

type Subtype = (typeof SUBTYPE_OPTIONS)[number]["value"];

function tokenBorderClass(colors: string[]): string {
  if (colors.length === 0) return "border-white/15";
  if (colors.length > 1) return "border-yellow-400/50";
  const map: Record<string, string> = {
    W: "border-yellow-100/50",
    U: "border-blue-400/50",
    B: "border-purple-400/50",
    R: "border-red-400/50",
    G: "border-green-400/50",
  };
  return map[colors[0]] ?? "border-white/15";
}

function buildUrl(
  q: string,
  colors: string[],
  subtype: Subtype,
  page: number,
  scryfallIds?: string[],
) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (colors.length > 0) params.set("colors", colors.join(","));
  if (subtype !== "all") params.set("subtype", subtype);
  if (scryfallIds && scryfallIds.length > 0)
    params.set("scryfallIds", scryfallIds.join(","));
  params.set("page", String(page));
  return `/api/tokens?${params.toString()}`;
}

export function BattlefieldTokenBrowser({
  onClose,
  onCreateToken,
  deckCardIds,
}: BattlefieldTokenBrowserProps) {
  const [mounted, setMounted] = useState(false);
  const [tokens, setTokens] = useState<TokenCard[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [subtype, setSubtype] = useState<Subtype>("all");
  const [quantity, setQuantity] = useState(1);
  const hasDeckContext = Boolean(deckCardIds && deckCardIds.length > 0);
  // If deck context exists, stay in "loading" state until related IDs are resolved
  const [relatedReady, setRelatedReady] = useState(!hasDeckContext);
  const [deckOnly, setDeckOnly] = useState(false);
  const [relatedScryfallIds, setRelatedScryfallIds] = useState<string[]>([]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch related token scryfallIds from the active decks
  useEffect(() => {
    if (!deckCardIds || deckCardIds.length === 0) return;
    fetch(`/api/tokens/related?cardIds=${deckCardIds.join(",")}`)
      .then((r) => r.json())
      .then((ids: string[]) => {
        setRelatedScryfallIds(ids);
        if (ids.length > 0) setDeckOnly(true);
      })
      .catch(() => {})
      .finally(() => setRelatedReady(true));
  }, [deckCardIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(rawSearch);
      setCurrentPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawSearch]);

  // Reset page when filters change — deps are triggers, not values used inside.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger deps
  useEffect(() => {
    setCurrentPage(1);
  }, [activeColors, subtype, deckOnly]);

  // Fetch tokens
  const fetchTokens = useCallback(
    async (page: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const ids = deckOnly ? relatedScryfallIds : undefined;
      try {
        const res = await fetch(
          buildUrl(search, activeColors, subtype, page, ids),
        );
        const data: TokensResponse = await res.json();
        setTokens((prev) => (append ? [...prev, ...data.tokens] : data.tokens));
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, activeColors, subtype, deckOnly, relatedScryfallIds],
  );

  useEffect(() => {
    if (!relatedReady) return;
    setTokens([]);
    fetchTokens(1, false);
    setCurrentPage(1);
  }, [fetchTokens, relatedReady]);

  const handleLoadMore = () => {
    const next = currentPage + 1;
    setCurrentPage(next);
    fetchTokens(next, true);
  };

  const toggleColor = (code: string) => {
    setActiveColors((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const clampQuantity = (v: number) => Math.max(1, Math.min(99, v));

  if (!mounted) return null;

  const hasMore = currentPage < totalPages;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onPointerDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0e1420] shadow-[0_16px_60px_rgba(0,0,0,0.7)]"
        style={{ width: 920, height: 740 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
              Tokens
            </p>
            <p className="mt-0.5 text-xs text-white/50">
              {loading
                ? "Carregando..."
                : `${total} token${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
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

        {/* Filters */}
        <div className="space-y-2.5 border-b border-white/8 px-5 py-3">
          {/* Search + quantity */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none"
            />
            {/* Quantity stepper */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-90"
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
                className="w-9 bg-transparent text-center text-sm font-bold tabular-nums text-white focus:outline-none"
              />
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-90"
                onClick={() => setQuantity((q) => clampQuantity(q + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Color chips + subtype */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map(
                ({ code, label, bg, text, border, activeBg, activeBorder }) => {
                  const active = activeColors.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleColor(code)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition ${
                        active
                          ? `${activeBg} ${activeBorder} ${text}`
                          : `${bg} ${border} ${text} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {label}
                    </button>
                  );
                },
              )}
              {activeColors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveColors([])}
                  className="ml-1 text-[10px] text-white/30 hover:text-white/60"
                >
                  limpar
                </button>
              )}
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-1">
              {SUBTYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSubtype(value)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    subtype === value
                      ? "bg-[#91a7da]/20 text-[#91a7da]"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {relatedScryfallIds.length > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => setDeckOnly((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    deckOnly
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${deckOnly ? "bg-emerald-400" : "bg-white/30"}`}
                  />
                  Fichas do deck
                </button>
              </>
            )}
          </div>
        </div>

        {/* Token grid */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-4 pb-4">
          {loading ? (
            <div className="grid grid-cols-6 gap-3 pt-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                  key={i}
                  className="skeleton-wave overflow-hidden rounded-xl border border-white/8"
                  style={{ aspectRatio: "5/7" }}
                />
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              Nenhum token encontrado
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-3 pt-3">
                {tokens.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    style={{ aspectRatio: "5/7" }}
                    className={`group relative overflow-hidden rounded-xl border transition hover:scale-[1.03] hover:border-white/40 active:scale-95 ${tokenBorderClass(token.colors)}`}
                    onClick={() => {
                      onCreateToken(token, quantity);
                      onClose();
                    }}
                  >
                    {token.imagePath ? (
                      <Image
                        src={token.imagePath}
                        alt={token.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5 text-[9px] text-white/30">
                        sem imagem
                      </div>
                    )}

                    {/* Name/stats overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 pb-2 pt-5">
                      <p className="truncate text-[10px] font-semibold leading-tight text-white drop-shadow">
                        {token.name}
                      </p>
                      {token.power !== null && token.toughness !== null && (
                        <p className="text-[9px] font-bold text-white/70">
                          {token.power}/{token.toughness}
                        </p>
                      )}
                      {token.loyalty !== null && (
                        <p className="text-[9px] font-bold text-amber-300/90">
                          ◆ {token.loyalty}
                        </p>
                      )}
                    </div>

                    {quantity > 1 && (
                      <div className="pointer-events-none absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#91a7da] px-1 text-[9px] font-bold text-[#0e1420]">
                        ×{quantity}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4 pb-2">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={handleLoadMore}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white/90 disabled:opacity-40"
                  >
                    {loadingMore
                      ? "Carregando..."
                      : `Carregar mais (${total - tokens.length} restantes)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-5 py-2.5 text-[10px] text-white/30">
          Clique em um token para criar{" "}
          {quantity === 1 ? "1 cópia" : `${quantity} cópias`} no campo de
          batalha
        </div>
      </div>
    </div>,
    document.body,
  );
}
