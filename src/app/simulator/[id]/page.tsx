import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKitWithCards } from "@/actions/cards";
import { AppShell } from "@/components/AppShell";
import { Sidebar } from "@/components/Sidebar";
import {
  type PlacedCardState,
  PrereleaseProvider,
} from "@/context/PrereleaseContext";
import { requireSessionUser } from "@/lib/auth-session";
import { DndCanvas } from "./DndCanvas";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kit = await getKitWithCards(params.id);
  if (!kit) return { title: "Kit not found" };
  const college = kit.college.charAt(0) + kit.college.slice(1).toLowerCase();
  return {
    title: `${college} Kit — Strixhaven Drafter`,
    description: `Prerelease kit for ${college} college. Open and build your sealed deck.`,
  };
}

export default async function SimulatorPage({ params }: Props) {
  await requireSessionUser();
  const kit = await getKitWithCards(params.id);
  if (!kit) notFound();

  const initialCards: PlacedCardState[] = kit.placedCards.map((p) => ({
    id: p.id,
    cardId: p.cardId,
    posX: p.posX,
    posY: p.posY,
    zIndex: p.zIndex,
    isMainDeck: p.isMainDeck,
    isFoil: p.isFoil,
    isPromo: p.cardId === kit.promoCardId,
    card: p.card as PlacedCardState["card"],
  }));

  return (
    <PrereleaseProvider initialCards={initialCards} kitId={kit.id}>
      <AppShell sidebar={<Sidebar />}>
        <DndCanvas />
      </AppShell>
    </PrereleaseProvider>
  );
}
