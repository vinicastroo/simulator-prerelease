"use client";

import { useTransition } from "react";
import { COLLEGES, type CollegeDef } from "@/lib/mtg/colleges";
import { createPrereleaseKit } from "@/actions/kit";

export function CollegeGrid() {
  const [isPending, startTransition] = useTransition();

  function handleSelect(collegeId: string) {
    startTransition(async () => {
      await createPrereleaseKit(collegeId);
    });
  }

  return (
    <ul
      className="grid gap-5 w-full max-w-6xl
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      aria-label="Select your Strixhaven college"
    >
      {COLLEGES.map((college) => (
        <CollegeCard
          key={college.id}
          college={college}
          isPending={isPending}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
}

// ─── College Card ─────────────────────────────────────────────────────────────

type CardProps = {
  college:   CollegeDef;
  isPending: boolean;
  onSelect:  (id: string) => void;
};

function CollegeCard({ college, isPending, onSelect }: CardProps) {
  const { theme } = college;

  return (
    <li>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onSelect(college.id)}
        aria-label={`Open a ${college.name} prerelease kit`}
        className={[
          "group relative w-full text-left rounded-2xl overflow-hidden",
          "border transition-all duration-300 outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-void",
          // Disabled while any action is running
          isPending
            ? "opacity-50 cursor-wait scale-[0.98]"
            : "hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99] cursor-pointer",
          // College-specific ring on hover
          `hover:${theme.ringClass}`,
          theme.borderClass,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          isPending
            ? undefined
            : {
                // Glow appears on hover via CSS variable trick
                ["--glow" as string]: theme.glowColor,
              }
        }
      >
        {/* ── Background gradient ── */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
          }}
        />

        {/* ── Hover glow overlay ── */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{
            boxShadow: `inset 0 0 40px 0 ${theme.glowColor}`,
          }}
        />

        {/* ── Subtle moving shine ── */}
        <div aria-hidden className="absolute inset-0 college-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col gap-3 p-5 min-h-[320px]">

          {/* Color pips + school */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {college.colors.map((c) => (
                <span
                  key={c.code}
                  title={c.label}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    text-[10px] font-bold shadow-md ${c.pip}
                  `}
                >
                  {c.code}
                </span>
              ))}
            </div>
            <span className="text-white/30 text-[10px] uppercase tracking-widest">
              {college.school}
            </span>
          </div>

          {/* Name */}
          <div className="mt-1">
            <h2 className={`text-2xl font-bold tracking-tight ${theme.accentClass}`}>
              {college.name}
            </h2>
            <p className="text-white/50 text-xs italic mt-0.5">{college.tagline}</p>
          </div>

          {/* Strategy */}
          <p className="text-white/70 text-sm leading-relaxed flex-1">
            {college.strategy}
          </p>

          {/* Keyword chips */}
          <div className="flex flex-wrap gap-1.5">
            {college.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/60"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div
            className={`
              mt-1 flex items-center justify-between
              border-t border-white/10 pt-3
            `}
          >
            <span className={`text-sm font-semibold ${theme.accentClass} transition-opacity`}>
              Open Kit
            </span>
            <Arrow className={`w-4 h-4 ${theme.accentClass} transition-transform group-hover:translate-x-1`} />
          </div>
        </div>

        {/* ── Spinner overlay when this kit is being generated ── */}
        {isPending && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-void/60 rounded-2xl">
            <Spinner className={`w-6 h-6 ${theme.accentClass}`} />
          </div>
        )}
      </button>
    </li>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth={2} stroke="currentColor" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="10" strokeOpacity={0.2} />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
