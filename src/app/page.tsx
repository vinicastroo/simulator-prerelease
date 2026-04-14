import type { Metadata } from "next";
import Link from "next/link";
import { CollegeGrid } from "@/components/CollegeGrid";
import { SignOutButton } from "@/components/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
            <Badge
              variant="outline"
              className="border-white/10 bg-transparent px-3 py-1 text-white/55"
            >
              Strixhaven Drafter
            </Badge>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/10 bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.06]"
              >
                <Link href="/decks">Meus decks</Link>
              </Button>
              <SignOutButton />
            </div>
          </div>
        </header>

        <section className="flex items-center justify-center flex-1 rounded-[2rem]  p-4 md:p-5">
          <CollegeGrid />
        </section>
      </div>
    </main>
  );
}
