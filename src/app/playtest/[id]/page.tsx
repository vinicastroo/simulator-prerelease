import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactDOM from "react-dom";
import { requireSessionUser } from "@/lib/auth-session";
import { fetchKitWithCards } from "@/lib/data/kit";
import { kitToGameData } from "@/lib/mtg/kit-to-game";
import { PlaytestClient } from "../PlaytestClient";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kit = await fetchKitWithCards(params.id);

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

  const kit = await fetchKitWithCards(params.id);
  if (!kit) notFound();

  for (const placed of kit.placedCards) {
    if (placed.card.imagePath) {
      ReactDOM.preload(placed.card.imagePath, { as: "image" });
    }
  }

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

  return (
    <PlaytestClient initialDeck={initialDeck} simulatorKitId={params.id} />
  );
}
