import type { Metadata } from "next";
import { CollegeGrid } from "@/components/CollegeGrid";

export const metadata: Metadata = {
  title: "Strixhaven Drafter — Choose Your College",
  description: "Open a Strixhaven prerelease kit and build your sealed deck.",
};

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-void flex flex-col">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-void/40 via-bg-void/80 to-bg-void z-10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 20%, rgba(77,99,147,0.14), transparent 28%), radial-gradient(circle at 82% 24%, rgba(59,130,246,0.08), transparent 24%), radial-gradient(circle at 50% 78%, rgba(139,92,246,0.07), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.015), transparent 22%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-20 flex flex-col h-full w-full max-w-6xl mx-auto px-6">
        <header className="flex flex-col items-center gap-2 text-center pt-12 pb-8 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-[1px] w-8 bg-gold-accent/40" />
            <p className="text-gold-accent text-[10px] uppercase tracking-[0.4em] font-semibold">
              The Biblioplex
            </p>
            <div className="h-[1px] w-8 bg-gold-accent/40" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase">
            Choose Your <span className="text-gold-accent">College</span>
          </h1>

          <p className="max-w-2xl text-sm text-white/45 leading-relaxed">
            Role pela lista das faculdades e escolha a que vai guiar o seu kit.
          </p>
        </header>

        <div className="relative flex-1 overflow-hidden mb-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-bg-void via-bg-void/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-bg-void via-bg-void/70 to-transparent" />

          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold-accent/55">
              Scroll Vertically
            </p>
            <p className="text-[11px] text-white/30">
              trackpad, roda do mouse ou arraste a barra
            </p>
          </div>

          <div className="h-[calc(100%-2rem)] pb-8">
            <CollegeGrid />
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-0 w-24 h-24 border-t border-l border-gold-accent/10 m-4 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-b border-r border-gold-accent/10 m-4 pointer-events-none" />
    </main>
  );
}
