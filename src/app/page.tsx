import type { Metadata } from "next";
import Link from "next/link";
import { CollegeGrid } from "@/components/CollegeGrid";
import { SignOutButton } from "@/components/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Strixhaven Drafter — Choose Your College",
  description: "Open a Strixhaven prerelease kit and build your sealed deck.",
};

export default async function Home() {
  await requireSessionUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070a] text-white">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#06070a]/30 via-[#06070a]/82 to-[#06070a]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 14% 18%, rgba(77,99,147,0.22), transparent 26%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1), transparent 22%), radial-gradient(circle at 52% 76%, rgba(103,73,154,0.1), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.025), transparent 20%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 left-[8%] w-px bg-white/10" />
        <div className="pointer-events-none absolute inset-y-0 right-[10%] w-px bg-white/5" />
      </div>

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-10 pb-8">
          <div className="flex items-center justify-between gap-4">
            <Badge
              variant="outline"
              className="border-[#30476f]/55 bg-[#162032]/50 px-3 py-1 text-[#9bb0e0]"
            >
              Selection Chamber
            </Badge>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.04] px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 hover:bg-white/[0.1]"
              >
                <Link href="/decks">Meus decks</Link>
              </Button>
              <SignOutButton />
            </div>
          </div>

          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.8fr] lg:items-end">
            <div className="space-y-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-[#8ea4d6]">
                The Biblioplex
              </p>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-black uppercase tracking-[-0.07em] text-white sm:text-6xl">
                  escolha a faculdade que vai marcar o seu proximo arquivo de
                  prerelease
                </h1>
                <p className="max-w-2xl text-sm leading-8 text-white/55 md:text-base">
                  Cada escolha abre um eixo diferente de build. Aqui a selecao
                  parece um ritual de catalogacao, nao uma grade comum de cards.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Etapa
                </p>
                <p className="mt-3 text-2xl font-black text-white">Escolha</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Resultado
                </p>
                <p className="mt-3 text-2xl font-black text-white">Novo kit</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Fluxo
                </p>
                <p className="mt-3 text-2xl font-black text-white">Imediato</p>
              </div>
            </div>
          </section>
        </header>

        <section className="relative mb-4 flex-1 overflow-hidden rounded-[2.25rem] border border-white/8 bg-[#0c0f15]/62 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 bg-gradient-to-b from-[#0c0f15] via-[#0c0f15]/78 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12 bg-gradient-to-t from-[#0c0f15] via-[#0c0f15]/78 to-transparent" />

          <div className="relative mb-4 flex flex-col gap-3 px-2 pb-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#91a7da]">
                Active colleges
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                selecione sua trilha de draft
              </h2>
            </div>
            <p className="text-[11px] leading-6 text-white/35">
              Role verticalmente e abra o kit direto do card da faculdade.
            </p>
          </div>

          <div className="h-[calc(100%-4rem)] pb-6">
            <CollegeGrid />
          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed left-0 top-0 m-4 h-24 w-24 border-l border-t border-gold-accent/10" />
      <div className="pointer-events-none fixed bottom-0 right-0 m-4 h-24 w-24 border-b border-r border-gold-accent/10" />
    </main>
  );
}
