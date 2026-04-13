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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 pb-10">
        <div className="space-y-3">
          <Badge variant="outline" className="border-border/70 px-3 py-1">
            Biblioteca Pessoal
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Meus decks
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">Novo deck</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kits.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-card/95 md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-white">Nenhum deck ainda</CardTitle>
              <CardDescription>
                Crie seu primeiro kit de prerelease para ele aparecer aqui.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t border-border/60 bg-muted/30">
              <Button asChild>
                <Link href="/">Criar primeiro deck</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          kits.map((kit) => (
            <Card
              key={kit.id}
              className="border-white/10 bg-card/95 shadow-xl shadow-black/20 transition hover:-translate-y-1"
            >
              <CardHeader>
                <CardAction>
                  <Badge variant="secondary">{kit.college}</Badge>
                </CardAction>
                <CardTitle className="text-white">
                  Deck {kit.college.toLowerCase()}
                </CardTitle>
                <CardDescription>
                  Criado em {kit.createdAt.toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator className="bg-white/10" />
                <p className="text-sm text-muted-foreground">
                  {kit._count.placedCards} cartas prontas para continuar no
                  simulador.
                </p>
              </CardContent>
              <CardFooter className="justify-between border-t border-border/60 bg-muted/30">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Abrir simulador
                </span>
                <Button asChild>
                  <Link href={`/simulator/${kit.id}`}>Abrir</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
