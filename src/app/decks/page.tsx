import Image from "next/image";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { DeleteDeckButton } from "./DeleteDeckButton";
import { requireSessionUser } from "@/lib/auth-session";
import { COLLEGES } from "@/lib/mtg/colleges";
import { prisma } from "@/lib/prisma";

export default async function DecksPage() {
  const user = await requireSessionUser();
  const kits = await prisma.prereleaseKit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      college: true,
      createdAt: true,
      placedCards: {
        select: { isMainDeck: true },
      },
    },
  });

  const collegesById = new Map(
    COLLEGES.map((college) => [college.id, college]),
  );

  return (
    <main className="h-dvh overflow-hidden bg-[#06070a] text-white">
      <div className="mx-auto flex h-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="shrink-0 px-1 pb-4">
          <TopNav activePage="decks" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.38em] text-white/35">
                {kits.length} {kits.length === 1 ? "deck" : "decks"}
              </p>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                seus decks
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                asChild
                className="rounded-full bg-white px-5 font-bold text-[#06070a] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]"
              >
                <Link href="/">Novo deck</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 pt-4">
          <div className="h-full overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#0d1016] p-3 sm:p-4">
            {kits.length === 0 ? (
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
                      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#10131a] transition-colors hover:border-white/20"
                    >
                      {/* College accent bar */}
                      {college && (
                        <div
                          className="absolute left-0 top-0 h-full w-[3px]"
                          style={{
                            background: `linear-gradient(180deg, ${college.theme.gradientFrom}, ${college.theme.gradientTo})`,
                          }}
                        />
                      )}

                      <div className="px-5 py-4 sm:px-6">
                        {/* Top row: logo + name + date */}
                        <div className="flex min-w-0 items-start gap-4">
                          {college && (
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10"
                              style={{
                                background: `${college.theme.gradientFrom}18`,
                              }}
                            >
                              <Image
                                src={college.logoPath}
                                alt={college.name}
                                width={28}
                                height={28}
                                className="h-7 w-7 object-contain opacity-90"
                                unoptimized
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-base font-bold text-white">
                                {college?.name ?? kit.college}
                              </p>
                              <p className="text-xs text-white/35">
                                {kit.createdAt.toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <p className="mt-0.5 text-xs text-white/40">
                              {college?.school}
                            </p>
                            {college && (
                              <p className="mt-0.5 text-[11px] italic text-white/30">
                                {college.tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
                            <span>Deck principal</span>
                            <span className="font-mono font-semibold text-white/60">
                              {mainCount}
                              <span className="text-white/30">/40</span>
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
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
                          {sideCount > 0 && (
                            <p className="mt-1 text-[11px] text-white/25">
                              {sideCount}{" "}
                              {sideCount === 1 ? "carta" : "cartas"} no
                              sideboard
                            </p>
                          )}
                        </div>

                        {/* Bottom row: colors + actions */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
                          <div className="flex items-center gap-1.5">
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
                          </div>

                          <div className="flex items-center gap-2">
                            <DeleteDeckButton deckId={kit.id} />
                            <Button
                              asChild
                              className="rounded-full bg-[#4d6393] px-5 text-white hover:bg-[#5f77ab]"
                            >
                              <Link href={`/simulator/${kit.id}`}>Abrir</Link>
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
