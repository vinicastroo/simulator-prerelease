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

function RoomRowSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/24 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-4 w-40 rounded-full bg-white/[0.08]" />
          <div className="flex items-center gap-3">
            <div className="h-3 w-20 rounded-full bg-white/[0.05]" />
            <div className="h-3 w-16 rounded-full bg-white/[0.04]" />
          </div>
        </div>
        <div className="h-9 w-24 rounded-xl border border-white/10 bg-white/[0.05]" />
      </div>
    </div>
  );
}

export default function GameLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative flex min-h-screen w-full animate-pulse flex-col px-6 py-8 lg:px-8">
        <header className="pb-5">
          <TopNavSkeleton />
          <div className="mt-8 mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-white/[0.04]" />
              <div className="h-10 w-44 rounded-full bg-white/[0.08]" />
              <div className="h-4 w-64 rounded-full bg-white/[0.05]" />
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="h-9 w-40 rounded-full border border-white/10 bg-white/[0.05]" />
              <div className="h-9 w-28 rounded-full border border-white/10 bg-white/[0.05]" />
            </div>
          </div>
        </header>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <RoomRowSkeleton key={index.toString()} />
          ))}
        </div>
      </div>
    </div>
  );
}
