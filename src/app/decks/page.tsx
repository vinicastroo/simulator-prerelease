import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
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
      _count: {
        select: {
          placedCards: {
            where: { isMainDeck: true },
          },
        },
      },
    },
  });

  const collegesById = new Map(
    COLLEGES.map((college) => [college.id, college]),
  );

  return (
    <main className="h-dvh overflow-hidden bg-[#06070a] text-white">
      <div className="mx-auto flex h-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="shrink-0 rounded-[1.75rem] border border-white/10 bg-[#0f131a] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge
                variant="outline"
                className="border-white/10 bg-white/[0.03] px-3 py-1 text-white/60"
              >
                Arquivo de Decks
              </Badge>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="rounded-full bg-[#4d6393] px-5 text-white hover:bg-[#5f77ab]"
                >
                  <Link href="/">Novo deck</Link>
                </Button>
                <SignOutButton />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                seus decks
              </h1>
              <p className="text-sm text-white/50">
                Abra qualquer deck rapidamente.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-sm text-white/45">
              <p>
                {kits.length} {kits.length === 1 ? "deck" : "decks"}
              </p>
              <p>
                {kits[0]
                  ? `Ultimo registro em ${kits[0].createdAt.toLocaleDateString("pt-BR")}`
                  : "Nenhum registro ainda"}
              </p>
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 pt-4">
          <div className="h-full overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#0d1016] p-3 sm:p-4">
            {kits.length === 0 ? (
              <Card className="rounded-[1.5rem] border-dashed border-white/15 bg-white/[0.03]">
                <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
                  <div className="text-xl font-bold text-white">
                    Nenhum deck ainda
                  </div>
                  <p className="text-sm text-white/52">
                    Crie seu primeiro kit de prerelease para ele aparecer aqui.
                  </p>
                </CardHeader>
                <CardFooter className="border-t border-white/10 bg-white/[0.03] px-6 py-5 sm:px-8 sm:py-6">
                  <Button
                    asChild
                    className="rounded-full bg-[#4d6393] text-white hover:bg-[#5f77ab]"
                  >
                    <Link href="/">Criar primeiro deck</Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-3">
                {kits.map((kit) => (
                  <article
                    key={kit.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-[#10131a] px-4 py-4 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-2">
                        {(collegesById.get(kit.college)?.colors ?? []).map(
                          (color) => (
                            <div
                              key={`${kit.id}-${color.code}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/15"
                            >
                              <Image
                                src={color.svgPath}
                                alt={color.label}
                                width={20}
                                height={20}
                                className="h-5 w-5 object-contain"
                                unoptimized
                              />
                            </div>
                          ),
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <p className="truncate text-base font-bold text-white">
                            Deck {kit.college.toLowerCase()}
                          </p>
                          <p className="text-xs font-mono font-semibold text-white/70">
                            {kit._count.placedCards}/40
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-white/45">
                          Criado em {kit.createdAt.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <Badge className="rounded-full border-[#30476f]/45 bg-[#162032]/70 text-[#cad7f8]">
                        {kit.college}
                      </Badge>

                      <Button
                        asChild
                        className="rounded-full bg-[#4d6393] px-5 text-white hover:bg-[#5f77ab]"
                      >
                        <Link href={`/simulator/${kit.id}`}>Abrir</Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
