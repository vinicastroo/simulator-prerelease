"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { createPrereleaseKit } from "@/actions/kit";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { COLLEGES, type CollegeDef } from "@/lib/mtg/colleges";
import { cn } from "@/lib/utils";

export function CollegeGrid() {
  const [isPending, startTransition] = useTransition();
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(
    null,
  );

  const selectedCollege =
    COLLEGES.find((college) => college.id === selectedCollegeId) ?? null;

  function handleSelect(collegeId: string) {
    setSelectedCollegeId(collegeId);
  }

  function handleConfirmSelection() {
    if (!selectedCollegeId) return;

    startTransition(async () => {
      await createPrereleaseKit(selectedCollegeId);
    });
  }

  return (
    <>
      <ul
        className="grid h-full w-full grid-cols-1 items-stretch gap-4 overflow-y-auto overflow-x-hidden px-2 pb-6 pt-1 md:grid-cols-2"
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

      <Dialog
        open={selectedCollege !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setSelectedCollegeId(null);
        }}
      >
        <DialogContent
          className="max-w-[min(96vw,460px)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1017] p-0 text-white sm:max-w-[min(96vw,460px)]"
          showCloseButton={!isPending}
        >
          {selectedCollege ? (
            <>
              {/* College-tinted radial glow behind header */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 90% 55% at 50% 0%, ${selectedCollege.theme.gradientFrom}22 0%, transparent 70%)`,
                }}
              />

              {/* ── Header ── */}
              <div className="relative px-6 pb-5 pt-7 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 drop-shadow-lg">
                    <Image
                      src={selectedCollege.logoPath}
                      alt={selectedCollege.name}
                      fill
                      className="object-contain"
                      unoptimized
                      priority
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                      Kit de prerelease
                    </p>
                    <DialogTitle
                      className={cn(
                        "text-[1.7rem] font-black leading-none tracking-[-0.05em]",
                        selectedCollege.theme.accentClass,
                      )}
                    >
                      {selectedCollege.name}
                    </DialogTitle>
                    <p className="mt-0.5 text-xs text-white/40">
                      {selectedCollege.school}
                    </p>
                  </div>
                </div>

                {/* Color pips */}
                <div className="mt-3 flex items-center gap-1.5">
                  {selectedCollege.colors.map((color) => (
                    <div key={color.code} className="relative h-5 w-5">
                      <Image
                        src={color.svgPath}
                        alt={color.label}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>

                {/* Tagline */}
                <DialogDescription className="mt-3 text-sm italic leading-relaxed text-white/45">
                  &ldquo;{selectedCollege.tagline}&rdquo;
                </DialogDescription>

                {/* Keywords */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedCollege.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{
                        background: `${selectedCollege.theme.gradientFrom}18`,
                        color: selectedCollege.theme.gradientFrom,
                        border: `1px solid ${selectedCollege.theme.gradientFrom}45`,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-6 h-px bg-white/8 sm:mx-8" />

              {/* ── Boosters ── */}
              <div className="px-5 py-5 sm:px-7">
                <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">
                  6 boosters incluídos
                </p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-[62px] shrink-0 booster-enter",
                        isPending && "booster-opening",
                      )}
                      style={
                        {
                          animationDelay: isPending
                            ? `${i * 55}ms`
                            : `${i * 45}ms`,
                          "--booster-rot": `${(i - 2.5) * 5}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <div className="relative aspect-[0.72] overflow-hidden rounded-xl shadow-[0_4px_18px_rgba(0,0,0,0.55)]">
                        <Image
                          src="/booster-secrets-of-strixhaven.png"
                          alt={`Booster ${i + 1} de Strixhaven`}
                          fill
                          className="object-contain"
                          priority={i < 3}
                          unoptimized
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between gap-3 border-t border-white/8 bg-white/[0.025] px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={() => setSelectedCollegeId(null)}
                  disabled={isPending}
                  className="text-sm text-white/45 transition-colors hover:text-white/70 disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${selectedCollege.theme.gradientFrom}, ${selectedCollege.theme.gradientTo})`,
                  }}
                >
                  {isPending ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Abrindo...
                    </>
                  ) : (
                    "Abrir kit →"
                  )}
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CollegeCard({
  college,
  isPending,
  onSelect,
}: {
  college: CollegeDef;
  isPending: boolean;
  onSelect: (id: string) => void;
}) {
  const { theme } = college;

  return (
    <li className="flex w-full">
      <button
        type="button"
        disabled={isPending}
        onClick={() => onSelect(college.id)}
        className={`flex w-full text-left transition-all duration-500 ${isPending ? "cursor-wait opacity-50 scale-[0.985]" : "hover:-translate-y-1"}`}
      >
        <div
          className={`
            group relative flex w-full flex-col overflow-hidden rounded-[28px]
            bg-[#0f0f0f]/90 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md
            transition-all duration-500
            ${isPending ? "" : "hover:shadow-[0_24px_70px_rgba(0,0,0,0.42)]"}
          `}
        >
          <div
            className="absolute inset-0 z-0 opacity-10 transition-opacity duration-500 group-hover:opacity-25"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, transparent 44%, rgba(0,0,0,0.18) 100%)`,
            }}
          />

          <div className="absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-white/[0.045] to-transparent" />

          <div className="absolute -right-6 top-10 z-10 flex items-center justify-center opacity-[0.04] transition-all duration-1000 group-hover:scale-110 group-hover:opacity-[0.08]">
            <Image
              src={college.logoPath}
              alt=""
              width={260}
              height={260}
              className="grayscale brightness-200 object-contain"
            />
          </div>

          {/* Header */}
          <div className="relative z-20 flex items-center gap-4 px-6 pt-6 md:px-8 md:pt-8">
            <div className="relative h-20 w-20 shrink-0 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-110">
              <Image
                src={college.logoPath}
                alt={`${college.name} Logo`}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-white/25">
                {college.school}
              </p>
              <div className="flex items-center gap-3">
                <p
                  className={`text-3xl font-black tracking-tighter uppercase drop-shadow-sm md:text-4xl ${theme.accentClass}`}
                >
                  {college.name}
                </p>
                <div className="flex gap-1">
                  {college.colors.map((color) => (
                    <div
                      key={color.code}
                      className="relative h-5 w-5 drop-shadow-md md:h-6 md:w-6"
                    >
                      <Image
                        src={color.svgPath}
                        alt={color.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="relative z-20 flex flex-row gap-2 px-6 pb-6 pt-4 md:px-8 md:pb-8">
            {college.keywords.map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{
                  borderColor: `${theme.gradientFrom}50`,
                  backgroundColor: `${theme.gradientFrom}18`,
                  color: theme.gradientFrom,
                }}
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>

        {isPending && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
              style={{
                borderColor: theme.gradientFrom,
                borderTopColor: "transparent",
              }}
            />
          </div>
        )}
      </button>
    </li>
  );
}
