import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  activePage?: "home" | "decks" | "game";
}

export function TopNav({ activePage }: TopNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
      <Link
        href="/"
        className="transition-opacity hover:opacity-85"
        aria-label="Draft Zone"
      >
        <Image
          src="/logo.svg"
          alt="Draft Zone"
          width={120}
          height={30}
          className="h-5 w-auto sm:h-9"
          priority
        />
      </Link>

      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          className={`rounded-full border-white/10 bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/[0.06] ${
            activePage === "decks"
              ? "text-white  border-white"
              : "text-white/70"
          }`}
        >
          <Link href="/decks">Meus decks</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className={`rounded-full border-white/10 bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/[0.06] ${
            activePage === "game" ? "text-white  border-white" : "text-white/70"
          }`}
        >
          <Link href="/game">Jogar com amigos</Link>
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}
