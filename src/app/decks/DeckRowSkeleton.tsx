export function DeckRowSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
      {/* Colored left accent bar (matches real card) */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] animate-pulse bg-white/[0.12]"
        style={{ animationDelay: `${delay}ms` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-black/[0.08] to-black/[0.18]" />

      <div className="relative z-10 px-5 py-4 sm:px-6">
        {/* Status badges + delete button */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-20 rounded-full animate-pulse border border-white/8 bg-white/[0.04]"
              style={{ animationDelay: `${delay}ms` }}
            />
            <div
              className="h-6 w-24 rounded-full animate-pulse border border-white/8 bg-white/[0.04]"
              style={{ animationDelay: `${delay + 50}ms` }}
            />
          </div>
          <div
            className="h-8 w-8 rounded-full animate-pulse bg-white/[0.04]"
            style={{ animationDelay: `${delay + 80}ms` }}
          />
        </div>

        {/* College logo + name / school / tagline */}
        <div className="flex items-start gap-4">
          <div
            className="h-14 w-14 shrink-0 rounded-2xl animate-pulse bg-white/[0.06]"
            style={{ animationDelay: `${delay + 100}ms` }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-5 w-40 rounded-full animate-pulse bg-white/[0.08]"
              style={{ animationDelay: `${delay + 130}ms` }}
            />
            <div
              className="h-3 w-24 rounded-full animate-pulse bg-white/[0.04]"
              style={{ animationDelay: `${delay + 160}ms` }}
            />
            <div
              className="h-3 w-52 rounded-full animate-pulse bg-white/[0.03]"
              style={{ animationDelay: `${delay + 190}ms` }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div
            className="h-3 w-24 rounded-full animate-pulse bg-white/[0.04]"
            style={{ animationDelay: `${delay + 220}ms` }}
          />
          <div className="flex items-center gap-3">
            <div
              className="h-2 flex-1 rounded-full animate-pulse bg-white/[0.07]"
              style={{ animationDelay: `${delay + 250}ms` }}
            />
            <div
              className="h-3 w-8 rounded-full animate-pulse bg-white/[0.05]"
              style={{ animationDelay: `${delay + 270}ms` }}
            />
          </div>
        </div>

        {/* Color icons + view-deck button */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full animate-pulse bg-white/[0.06]"
              style={{ animationDelay: `${delay + 290}ms` }}
            />
            <div
              className="h-6 w-6 rounded-full animate-pulse bg-white/[0.06]"
              style={{ animationDelay: `${delay + 310}ms` }}
            />
            <div
              className="h-3 w-20 rounded-full animate-pulse bg-white/[0.04]"
              style={{ animationDelay: `${delay + 330}ms` }}
            />
          </div>
          <div
            className="h-9 w-24 rounded-full animate-pulse border border-white/10 bg-white/[0.05]"
            style={{ animationDelay: `${delay + 360}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
