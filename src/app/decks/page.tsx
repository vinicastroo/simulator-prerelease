import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
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
    <main className="min-h-screen bg-bg-void px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-accent/70">
            Biblioteca Pessoal
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Meus decks
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 transition hover:bg-white/[0.1]"
          >
            Novo deck
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kits.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-8 text-white/55">
            <h2 className="text-xl font-bold text-white">Nenhum deck ainda</h2>
            <p className="mt-2 text-sm leading-6">
              Crie seu primeiro kit de prerelease para ele aparecer aqui.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-gold-accent px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black"
            >
              Criar primeiro deck
            </Link>
          </div>
        ) : (
          kits.map((kit) => (
            <Link
              key={kit.id}
              href={`/simulator/${kit.id}`}
              className="rounded-[28px] border border-white/10 bg-[#10131b]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-gold-accent/30"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold-accent/70">
                {kit.college}
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                Deck {kit.college.toLowerCase()}
              </h2>
              <p className="mt-3 text-sm text-white/45">
                {kit._count.placedCards} cartas · criado em{" "}
                {kit.createdAt.toLocaleDateString("pt-BR")}
              </p>
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                Abrir simulador
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
