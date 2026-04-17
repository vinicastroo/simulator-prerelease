function TopNavSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
      <div className="h-8 w-32 rounded-full border border-white/10 bg-white/[0.04]" />
      <div className="flex items-center gap-3">
        <div className="h-8 w-28 rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="h-8 w-24 rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.04]" />
      </div>
    </div>
  );
}

function DeckRowSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/28 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-black/[0.08] to-black/[0.18]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div className="relative space-y-4 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full border border-white/10 bg-white/[0.04]" />
            <div className="h-6 w-20 rounded-full border border-white/10 bg-white/[0.04]" />
          </div>
          <div className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04]" />
        </div>
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 rounded-full bg-white/[0.08]" />
            <div className="h-3 w-32 rounded-full bg-white/[0.05]" />
            <div className="h-3 w-48 rounded-full bg-white/[0.04]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full bg-white/[0.04]" />
          <div className="h-2 rounded-full bg-white/[0.07]" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/[0.06]" />
            <div className="h-6 w-6 rounded-full bg-white/[0.06]" />
            <div className="h-3 w-20 rounded-full bg-white/[0.04]" />
          </div>
          <div className="h-9 w-24 rounded-full border border-white/10 bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

export default function DecksLoading() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative flex h-full w-full animate-pulse flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="shrink-0 px-1 pb-4">
          <TopNavSkeleton />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-20 rounded-full bg-white/[0.04]" />
              <div className="h-10 w-40 rounded-full bg-white/[0.08]" />
            </div>
            <div className="h-9 w-28 rounded-full border border-white/10 bg-white/[0.05]" />
          </div>
        </header>

        <section className="min-h-0 flex-1 pt-4">
          <div className="h-full overflow-hidden rounded-[1.75rem] p-3 sm:p-4">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <DeckRowSkeleton key={index.toString()} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
