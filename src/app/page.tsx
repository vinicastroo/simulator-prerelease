import type { Metadata } from "next";
import { CollegeGrid } from "@/components/CollegeGrid";

export const metadata: Metadata = {
  title: "Strixhaven Drafter — Choose Your College",
  description:
    "Open a Strixhaven prerelease kit and build your sealed deck. " +
    "Pick your college to begin.",
};

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-bg-void flex flex-col items-center justify-center gap-10 px-6 py-16">
      {/* Header */}
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="text-gold-accent/60 text-xs uppercase tracking-[0.3em] font-medium">
          Secrets of Strixhaven
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Choose Your{" "}
          <span className="text-gold-accent">College</span>
        </h1>
        <p className="text-white/40 text-sm max-w-md leading-relaxed">
          Select a Strixhaven college to generate your prerelease kit —
          5 Play Boosters, 1 Seeded Booster, and 1 Promo Card.
        </p>
      </header>

      {/* College selection grid */}
      <CollegeGrid />

      {/* Footer hint */}
      <p className="text-white/20 text-xs text-center">
        85 cards · SQLite · Optimistic UI
      </p>
    </main>
  );
}
