import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/decks");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(77,99,147,0.28),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(112,75,149,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-[9%] w-px bg-white/10" />
      <div className="pointer-events-none absolute inset-y-0 right-[12%] w-px bg-white/5" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-16 px-6 py-12 lg:grid-cols-[1.1fr_420px] lg:px-10">
        <section className="hidden lg:block">
          <div className="max-w-2xl space-y-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-[#8ea4d6]">
              Strixhaven Archive
            </p>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-6xl font-black uppercase tracking-[-0.06em] text-white">
                retome seus decks como quem abre um grimorio marcado
              </h1>
              <p className="max-w-xl text-base leading-8 text-white/55">
                Seu acervo de builds, sideboards e experimentos de prerelease em
                um painel com cara de sala de estudo arcana, nao de tela
                generica de login.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Biblioteca
                </p>
                <p className="mt-3 text-2xl font-black text-white">Decks</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Sessao
                </p>
                <p className="mt-3 text-2xl font-black text-white">Privada</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Fluxo
                </p>
                <p className="mt-3 text-2xl font-black text-white">Rapido</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center lg:justify-end">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
