import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKitWithCards } from "@/actions/cards";
import { requireSessionUser } from "@/lib/auth-session";
import { kitToGameData } from "@/lib/mtg/kit-to-game";
import { PlaytestClient } from "../PlaytestClient";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kit = await getKitWithCards(params.id);

  if (!kit) {
    return { title: "Playtest" };
  }

  const college = kit.college.charAt(0) + kit.college.slice(1).toLowerCase();

  return {
    title: `Playtest - ${college} Kit`,
  };
}

export default async function PlaytestKitPage({ params }: Props) {
  await requireSessionUser();

  const kit = await getKitWithCards(params.id);
  if (!kit) notFound();

  const initialDeck = kitToGameData(
    kit.placedCards.map((placed) => ({
      id: placed.id,
      isMainDeck: placed.isMainDeck,
      card: {
        id: placed.card.id,
        name: placed.card.name,
        imagePath: placed.card.imagePath,
        manaCost: placed.card.manaCost,
        typeLine: placed.card.typeLine,
        oracleText: placed.card.oracleText,
        power: placed.card.power,
        toughness: placed.card.toughness,
      },
    })),
    "playtest-player",
  );

  return <PlaytestClient initialDeck={initialDeck} />;
}
