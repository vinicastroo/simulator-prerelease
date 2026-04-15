"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { createPrereleaseKit } from "@/actions/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
          className="max-w-[min(96vw,1200px)] rounded-[1.75rem] border border-white/10 bg-[#0d1017] p-0 text-white sm:max-w-[min(96vw,1200px)]"
          showCloseButton={!isPending}
        >
          {selectedCollege ? (
            <>
              <DialogHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Kit de prerelease
                </p>
                <DialogTitle
                  className={cn(
                    "text-3xl font-black tracking-[-0.05em] text-white",
                    selectedCollege.theme.accentClass,
                  )}
                >
                  {selectedCollege.name}
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-7 text-white/50">
                  Seu kit sera aberto com 6 boosters de Strixhaven antes de ir
                  para o simulador.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 pb-6 pt-4 sm:px-8">
                <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max justify-center gap-3">
                    {Array.from({ length: 6 }, (_, index) => ({
                      boosterId: `booster-${index + 1}`,
                      number: index + 1,
                      priority: index < 3,
                    })).map((booster) => (
                      <div
                        key={booster.boosterId}
                        className={cn(
                          "w-[150px] shrink-0 transition-all duration-500",
                          isPending &&
                            "animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-6",
                        )}
                        style={{
                          animationDelay: isPending
                            ? `${booster.number * 45}ms`
                            : undefined,
                        }}
                      >
                        <div className="relative aspect-[0.72] overflow-hidden rounded-[0.9rem]">
                          <Image
                            src="/booster-secrets-of-strixhaven.png"
                            alt={`Booster ${booster.number} de Strixhaven`}
                            fill
                            className="object-contain"
                            priority={booster.priority}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="rounded-b-[1.75rem] border-t border-white/10 bg-white/[0.03] px-6 py-4 sm:px-8">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06]"
                  onClick={() => setSelectedCollegeId(null)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="bg-[#4d6393] text-white hover:bg-[#5f77ab]"
                  onClick={handleConfirmSelection}
                  disabled={isPending}
                >
                  {isPending ? "Abrindo kit..." : "Abrir kit"}
                </Button>
              </DialogFooter>
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
