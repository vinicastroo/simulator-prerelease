function TopNavSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
      <div className="h-6 w-28 rounded-full animate-pulse bg-white/[0.06] sm:h-8" />
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-24 rounded-full animate-pulse bg-white/[0.04]"
          style={{ animationDelay: "60ms" }}
        />
        <div
          className="h-8 w-28 rounded-full animate-pulse bg-white/[0.04]"
          style={{ animationDelay: "100ms" }}
        />
        <div
          className="h-8 w-36 rounded-full animate-pulse bg-white/[0.04]"
          style={{ animationDelay: "140ms" }}
        />
        <div
          className="h-8 w-8 rounded-full animate-pulse bg-white/[0.04]"
          style={{ animationDelay: "180ms" }}
        />
      </div>
    </div>
  );
}

function SectionSkeleton({
  rows = 5,
  delay = 0,
}: {
  rows?: number;
  delay?: number;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="border-b border-white/8 px-5 py-3">
        <div
          className="h-2.5 w-32 rounded-full animate-pulse bg-white/[0.06]"
          style={{ animationDelay: `${delay}ms` }}
        />
        <div
          className="mt-1.5 h-2 w-48 rounded-full animate-pulse bg-white/[0.03]"
          style={{ animationDelay: `${delay + 40}ms` }}
        />
      </div>
      <div className="divide-y divide-white/[0.05]">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i.toString()}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-5 w-5 rounded-full animate-pulse bg-white/[0.06]"
                style={{ animationDelay: `${delay + i * 30}ms` }}
              />
              <div
                className="h-3.5 w-20 rounded-full animate-pulse bg-white/[0.05]"
                style={{ animationDelay: `${delay + i * 30 + 20}ms` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-7 w-7 rounded-lg animate-pulse bg-white/[0.04]"
                style={{ animationDelay: `${delay + i * 30 + 40}ms` }}
              />
              <div
                className="h-4 w-5 rounded animate-pulse bg-white/[0.05]"
                style={{ animationDelay: `${delay + i * 30 + 50}ms` }}
              />
              <div
                className="h-7 w-7 rounded-lg animate-pulse bg-white/[0.04]"
                style={{ animationDelay: `${delay + i * 30 + 60}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GeneratorManaLoading() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />

      <div className="relative mx-auto flex w-full flex-col px-4 pt-4 pb-14 sm:px-6 sm:pt-6 sm:pb-16">
        <header className="shrink-0 px-1 pb-6">
          <TopNavSkeleton />
          <div className="mt-6 space-y-2">
            <div className="h-2.5 w-16 rounded-full animate-pulse bg-white/[0.04]" />
            <div
              className="h-10 w-48 rounded-full animate-pulse bg-white/[0.08]"
              style={{ animationDelay: "60ms" }}
            />
            <div
              className="h-3 w-72 rounded-full animate-pulse bg-white/[0.03]"
              style={{ animationDelay: "120ms" }}
            />
          </div>
        </header>

        <div className="space-y-4">
          <SectionSkeleton rows={5} delay={0} />
          <SectionSkeleton rows={10} delay={80} />
          <SectionSkeleton rows={2} delay={160} />
          <div
            className="h-11 w-full rounded-full animate-pulse bg-white/[0.08]"
            style={{ animationDelay: "200ms" }}
          />
        </div>
      </div>
    </main>
  );
}
