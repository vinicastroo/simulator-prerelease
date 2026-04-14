import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireSessionUser } from "@/lib/auth-session";
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
        select: { placedCards: true },
      },
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070a] px-6 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(77,99,147,0.22),transparent_24%),radial-gradient(circle_at_75%_10%,rgba(70,85,140,0.18),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border-[#30476f]/55 bg-[#162032]/50 px-3 py-1 text-[#9bb0e0]"
            >
              Biblioteca Pessoal
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-5xl font-black tracking-[-0.06em] text-white">
                seus decks vivem aqui como um arquivo de campanha
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/52">
                Volte para builds antigas, compare faculdades e continue o deck
                no ponto em que ele parou.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="rounded-full bg-[#4d6393] px-5 text-white hover:bg-[#5f77ab]"
            >
              <Link href="/">Novo deck</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
              Total de decks
            </p>
            <p className="mt-3 text-3xl font-black text-white">{kits.length}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
              Ultima atividade
            </p>
            <p className="mt-3 text-lg font-black text-white">
              {kits[0]
                ? kits[0].createdAt.toLocaleDateString("pt-BR")
                : "Sem registro"}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
              Colecoes
            </p>
            <p className="mt-3 text-lg font-black text-white">
              Strixhaven Archive
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kits.length === 0 ? (
            <Card className="rounded-[2rem] border-dashed border-white/15 bg-white/[0.03] md:col-span-2 xl:col-span-3">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-white">Nenhum deck ainda</CardTitle>
                <CardDescription className="text-white/52">
                  Crie seu primeiro kit de prerelease para ele aparecer aqui.
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t border-white/10 bg-white/[0.03] px-8 py-6">
                <Button
                  asChild
                  className="rounded-full bg-[#4d6393] text-white hover:bg-[#5f77ab]"
                >
                  <Link href="/">Criar primeiro deck</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            kits.map((kit) => (
              <Card
                key={kit.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#10131a]/88 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#4d6393]/40"
              >
                <div className="h-1 w-full bg-[linear-gradient(90deg,#4d6393_0%,#90a4da_50%,#4d6393_100%)] opacity-80" />
                <CardHeader className="space-y-4 px-6 pt-6">
                  <CardAction>
                    <Badge className="border-[#30476f]/45 bg-[#162032]/70 text-[#cad7f8]">
                      {kit.college}
                    </Badge>
                  </CardAction>
                  <CardTitle className="text-2xl font-black tracking-[-0.04em] text-white">
                    Deck {kit.college.toLowerCase()}
                  </CardTitle>
                  <CardDescription className="text-white/45">
                    Criado em {kit.createdAt.toLocaleDateString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6">
                  <Separator className="bg-white/10" />
                  <p className="text-sm leading-7 text-white/55">
                    {kit._count.placedCards} cartas prontas para continuar no
                    simulador.
                  </p>
                  <div className="flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/32">
                        Registro
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white/78">
                        {kit.college} collection
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/32">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#9ab1e6]">
                        Disponivel
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-white/10 bg-white/[0.03] px-6 py-5">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
                    Abrir simulador
                  </span>
                  <Button
                    asChild
                    className="rounded-full bg-[#4d6393] px-5 text-white hover:bg-[#5f77ab]"
                  >
                    <Link href={`/simulator/${kit.id}`}>Abrir</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
