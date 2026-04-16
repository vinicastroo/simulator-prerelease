import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/decks");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070a] text-white">
      {/* Luz de fundo atrás do form */}
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-16 px-6 py-12 lg:grid-cols-[1fr_420px] lg:px-10">
        <section className="hidden lg:block">
          <div className="max-w-xl space-y-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-white/30">
              Draft Simulator
            </p>

            <h1 className="text-6xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-white">
              draft. construa. jogue.
            </h1>

            <p className="text-base leading-8 text-white/45">
              Crie sua conta e comece a simular drafts de Magic: The Gathering.
              Salve seus decks, refine suas estratégias e evolua como jogador.
            </p>

            <div className="space-y-3 pt-2">
              {[
                {
                  label: "Gratuito",
                  desc: "Sem custos, sem limitações de uso",
                },
                {
                  label: "Seus decks salvos",
                  desc: "Acesse de qualquer lugar, a qualquer hora",
                },
                {
                  label: "Histórico completo",
                  desc: "Acompanhe sua evolução draft a draft",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                  <div>
                    <span className="text-sm font-semibold text-white/80">
                      {item.label}
                    </span>
                    <span className="text-sm text-white/35">
                      {" "}
                      — {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center lg:justify-end">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
