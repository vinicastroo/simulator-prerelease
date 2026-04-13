"use client";

import Image from "next/image";
import { useTransition } from "react";
import { createPrereleaseKit } from "@/actions/kit";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COLLEGES, type CollegeDef } from "@/lib/mtg/colleges";
import { cn } from "@/lib/utils";

export function CollegeGrid() {
  const [isPending, startTransition] = useTransition();

  function handleSelect(collegeId: string) {
    startTransition(async () => {
      await createPrereleaseKit(collegeId);
    });
  }

  return (
    <ul
      className="flex h-full w-full flex-col gap-5 overflow-y-auto overflow-x-hidden px-2 pb-6 pt-1 [scrollbar-color:rgba(77,99,147,0.65)_transparent] [scrollbar-width:thin]"
      style={{ scrollbarGutter: "stable both-edges" }}
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
    <li className="w-full">
      <button
        type="button"
        disabled={isPending}
        onClick={() => onSelect(college.id)}
        className={`block w-full text-left transition-all duration-500 ${isPending ? "cursor-wait opacity-50 scale-[0.985]" : "hover:-translate-y-1"}`}
      >
        <Card
          className={`
            group relative min-h-[24rem] overflow-hidden rounded-[28px]
            border border-white/8 bg-[#0f0f0f]/90 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md
            transition-all duration-500 md:min-h-[26rem]
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

          <CardHeader className="relative z-20 px-6 py-6 md:px-8 md:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
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
                    <CardTitle
                      className={`text-3xl font-black tracking-tighter uppercase drop-shadow-sm md:text-4xl ${theme.accentClass}`}
                    >
                      {college.name}
                    </CardTitle>
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

              <Badge
                variant="outline"
                className="hidden border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/55 md:inline-flex"
              >
                Strixhaven
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-20 flex h-full flex-col justify-between px-6 pb-6 md:px-8 md:pb-8">
            <div className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_0.9fr]">
              <p className="max-w-xl text-sm leading-7 text-white/65 md:text-[15px]">
                {college.tagline}
              </p>

              <div className="flex flex-wrap content-start gap-2">
                {college.keywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/8 pt-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/25">
                Choose your path
              </div>

              <div
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  `rounded-2xl border-white/8 bg-white/[0.06] px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-white/[0.1] ${theme.accentClass}`,
                )}
              >
                Enroll Now
              </div>
            </div>
          </CardContent>
        </Card>

        {isPending && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div
              className="w-8 h-8 border-4 border-t-transparent animate-spin rounded-full"
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
