import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  activePage?: "home" | "decks" | "game";
}

export function TopNav({ activePage }: TopNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
      <Link href="/">
        <Badge
          variant="outline"
          className="border-white/10 bg-transparent px-3 py-1 text-white/55 hover:text-white/80 transition-colors cursor-pointer"
        >
          Strixhaven Drafter
        </Badge>
      </Link>

      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          className={`rounded-full border-white/10 bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/[0.06] ${
            activePage === "decks"
              ? "text-white border-white/25 bg-white/[0.06]"
              : "text-white/70"
          }`}
        >
          <Link href="/decks">Meus decks</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className={`rounded-full border-white/10 bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/[0.06] ${
            activePage === "game"
              ? "text-white border-white/25 bg-white/[0.06]"
              : "text-white/70"
          }`}
        >
          <Link href="/game">Jogar</Link>
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}
