import type { Metadata } from "next";
import { CollegeGrid } from "@/components/CollegeGrid";
import { TopNav } from "@/components/TopNav";
import { requireSessionUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Draft Zone — Choose Your College",
  description: "Open a prerelease kit and build your sealed deck.",
};

export default async function Home() {
  await requireSessionUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative flex min-h-screen w-full flex-col px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-12 pb-10">
          <TopNav activePage="home" />
        </header>

        <section className="flex items-center justify-center flex-1 rounded-[2rem]  p-4 md:p-5">
          <CollegeGrid />
        </section>
      </div>
    </main>
  );
}
