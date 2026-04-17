import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface TopNavProps {
  activePage?: "home" | "decks" | "game" | "mana";
}

export function TopNav({ activePage }: TopNavProps) {
  return (
    <div className="border-b border-white/8 pb-5">
      <div className="flex items-center justify-between gap-4 sm:hidden">
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
            className="h-5 w-auto"
            priority
          />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-transparent text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-white/10 bg-[#07101f] text-white"
          >
            <SheetHeader className="px-5 pt-5">
              <SheetTitle className="text-white">Navegação</SheetTitle>
              <SheetDescription className="text-white/45">
                Acesse as principais áreas do Draft Zone.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-5 pb-5">
              <SheetClose asChild>
                <Link
                  href="/decks"
                  className={`rounded-full border px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] transition hover:bg-white/[0.06] ${
                    activePage === "decks"
                      ? "border-white text-white"
                      : "border-white/10 text-white/70"
                  }`}
                >
                  Meus decks
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/generator-mana"
                  className={`rounded-full border px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] transition hover:bg-white/[0.06] ${
                    activePage === "mana"
                      ? "border-white text-white"
                      : "border-white/10 text-white/70"
                  }`}
                >
                  Base de mana
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/game"
                  className={`rounded-full border px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] transition hover:bg-white/[0.06] ${
                    activePage === "game"
                      ? "border-white text-white"
                      : "border-white/10 text-white/70"
                  }`}
                >
                  Jogar com amigos
                </Link>
              </SheetClose>
              <div className="pt-2">
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden items-center justify-between gap-4 sm:flex">
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
            className="h-9 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center justify-end gap-3">
          <Button
            asChild
            variant="outline"
            className={`rounded-full border-white/10 bg-transparent px-3 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-white/[0.06] sm:px-4 sm:text-[11px] sm:tracking-[0.2em] ${
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
            className={`rounded-full border-white/10 bg-transparent px-3 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-white/[0.06] sm:px-4 sm:text-[11px] sm:tracking-[0.2em] ${
              activePage === "mana"
                ? "text-white border-white"
                : "text-white/70"
            }`}
          >
            <Link href="/generator-mana">Base de mana</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={`rounded-full border-white/10 bg-transparent px-3 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-white/[0.06] sm:px-4 sm:text-[11px] sm:tracking-[0.2em] ${
              activePage === "game"
                ? "text-white  border-white"
                : "text-white/70"
            }`}
          >
            <Link href="/game">Jogar com amigos</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
