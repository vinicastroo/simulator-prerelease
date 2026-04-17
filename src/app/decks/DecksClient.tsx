"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { COLLEGES, type CollegeDef } from "@/lib/mtg/colleges";
import { DeleteDeckButton } from "./DeleteDeckButton";

type CollegeId = CollegeDef["id"];

export type DeckListItem = {
  id: string;
  college: CollegeId;
  createdAt: string;
  placedCards: { isMainDeck: boolean | null }[];
};

export const DECKS_QUERY_KEY = ["decks"] as const;

async function fetchDecks(): Promise<DeckListItem[]> {
  const res = await fetch("/api/decks", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar decks");
  return res.json();
}

export function DecksClient() {
  const {
    data: kits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: DECKS_QUERY_KEY,
    queryFn: fetchDecks,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const collegesById = new Map(
    COLLEGES.map((college) => [college.id, college]),
  );

  return (
    <main className="relative h-dvh overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative flex h-full w-full flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="shrink-0 px-1 pb-4">
          <TopNav activePage="decks" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.38em] text-white/35">
                {isLoading
                  ? "carregando…"
                  : `${kits.length} ${kits.length === 1 ? "deck" : "decks"}`}
              </p>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                Seus decks
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                asChild
                className="rounded-full bg-white px-5 font-bold text-[#06070a]  hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]"
              >
                <Link href="/">Novo deck</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 pt-4">
          <div className="h-full overflow-y-auto rounded-[1.75rem] p-3 [scrollbar-color:#4d6393_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4d6393]/80 [&::-webkit-scrollbar-thumb:hover]:bg-[#7c3aed]/70 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 sm:p-4">
            {isError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm font-semibold text-white/60">
                  Não foi possível carregar os decks.
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {(["sk0", "sk1", "sk2"] as const).map((skKey) => (
                  <div
                    key={skKey}
                    className="h-[148px] animate-pulse rounded-[1.5rem] border border-white/10 bg-black/28 backdrop-blur-xl"
                  />
                ))}
              </div>
            ) : kits.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 px-8 py-16 text-center">
                <div className="flex gap-3 opacity-30">
                  {COLLEGES.map((c) => (
                    <Image
                      key={c.id}
                      src={c.logoPath}
                      alt={c.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                      unoptimized
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-white">
                    Nenhum deck ainda
                  </p>
                  <p className="text-sm text-white/40">
                    Crie seu primeiro kit de prerelease para ele aparecer aqui.
                  </p>
                </div>
                <Button
                  asChild
                  className="rounded-full bg-white px-5 font-bold text-[#06070a] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]"
                >
                  <Link href="/">Criar primeiro deck</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {kits.map((kit) => {
                  const college = collegesById.get(kit.college);
                  const mainCount = kit.placedCards.filter(
                    (c) => c.isMainDeck === true,
                  ).length;
                  const sideCount = kit.placedCards.filter(
                    (c) => c.isMainDeck === false,
                  ).length;
                  const progress = Math.min((mainCount / 40) * 100, 100);

                  return (
                    <article
                      key={kit.id}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl transition-colors hover:border-white/14 hover:bg-black/34"
                    >
                      {college && (
                        <div
                          className="absolute left-0 top-0 h-full w-[3px]"
                          style={{
                            background: `linear-gradient(180deg, ${college.theme.gradientFrom}, ${college.theme.gradientTo})`,
                          }}
                        />
                      )}

                      <div className="relative z-10 px-5 py-4 sm:px-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[10px] font-medium tracking-[0.12em] text-white/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                              {mainCount >= 40 ? "Pronto" : "Em montagem"}
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[10px] font-medium tracking-[0.12em] text-white/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                              {new Date(kit.createdAt).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>

                          <DeleteDeckButton deckId={kit.id} />
                        </div>

                        {/* Top row: logo + name + date */}
                        <div className="flex min-w-0 items-start gap-4">
                          {college && (
                            <div
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                              style={{
                                background: `linear-gradient(180deg, ${college.theme.gradientFrom}24, rgba(0,0,0,0.18))`,
                                borderColor: `${college.theme.gradientFrom}66`,
                                boxShadow: `0 12px 30px ${college.theme.gradientFrom}18`,
                              }}
                            >
                              <Image
                                src={college.logoPath}
                                alt={college.name}
                                width={28}
                                height={28}
                                className="h-8 w-8 object-contain opacity-95"
                                unoptimized
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-lg font-bold tracking-[-0.03em] text-white">
                                {college?.name ?? kit.college}
                              </p>
                            </div>
                            <p className="mt-0.5 text-xs uppercase tracking-[0.22em] text-white/32">
                              {college?.school}
                            </p>
                            {college && (
                              <p className="mt-1 text-[11px] italic leading-relaxed text-white/36">
                                {college.tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
                            <span>Deck principal</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                              {college && (
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${college.theme.gradientFrom}, ${college.theme.gradientTo})`,
                                  }}
                                />
                              )}
                            </div>
                            <span className="font-mono text-xs font-semibold text-white/48">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          {sideCount > 0 && (
                            <p className="mt-1 text-[11px] text-white/25">
                              {sideCount} {sideCount === 1 ? "carta" : "cartas"}{" "}
                              no sideboard
                            </p>
                          )}
                        </div>

                        {/* Bottom row: colors + actions */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
                          <div className="flex items-center gap-3">
                            {(college?.colors ?? []).map((color) => (
                              <div
                                key={color.code}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/15"
                              >
                                <Image
                                  src={color.svgPath}
                                  alt={color.label}
                                  width={16}
                                  height={16}
                                  className="h-4 w-4 object-contain"
                                  unoptimized
                                />
                              </div>
                            ))}
                            <span className="text-[11px] text-white/30">
                              {sideCount} no sideboard
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              className="rounded-full border border-[#6d84b4]/22 bg-[#4d6393]/22 px-5 text-white/88  hover:border-[#8599c3]/30 hover:bg-[#4d6393]/30 hover:text-white"
                            >
                              <Link href={`/simulator/${kit.id}`}>
                                Ver deck
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
