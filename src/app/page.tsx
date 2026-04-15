import type { Metadata } from "next";
import { CollegeGrid } from "@/components/CollegeGrid";
import { TopNav } from "@/components/TopNav";
import { requireSessionUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Strixhaven Drafter — Choose Your College",
  description: "Open a Strixhaven prerelease kit and build your sealed deck.",
};

export default async function Home() {
  await requireSessionUser();

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-8">
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
