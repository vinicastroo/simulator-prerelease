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

function CollegeCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/28 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-black/[0.08] to-black/[0.18]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div className="relative space-y-6 px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-3 w-28 rounded-full bg-white/[0.05]" />
            <div className="h-8 w-40 rounded-full bg-white/[0.08]" />
            <div className="flex gap-1.5">
              <div className="h-5 w-5 rounded-full bg-white/[0.06]" />
              <div className="h-5 w-5 rounded-full bg-white/[0.06]" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full border border-white/10 bg-white/[0.04]" />
          <div className="h-6 w-24 rounded-full border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative flex min-h-screen w-full animate-pulse flex-col px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-12 pb-10">
          <TopNavSkeleton />
        </header>

        <section className="flex flex-1 items-center justify-center rounded-[2rem] p-4 md:p-5">
          <div className="grid h-full w-full grid-cols-1 gap-4 overflow-hidden px-2 pb-6 pt-1 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <CollegeCardSkeleton key={index.toString()} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
