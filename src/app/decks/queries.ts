import { prisma } from "@/lib/prisma";
import type { CollegeDef } from "@/lib/mtg/colleges";
import type { DeckListItem } from "./DecksClient";

type CollegeId = CollegeDef["id"];

export async function getDecksForUser(userId: string): Promise<DeckListItem[]> {
  const kits = await prisma.prereleaseKit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      college: true,
      createdAt: true,
      placedCards: { select: { isMainDeck: true } },
    },
  });
  return kits.map((kit) => ({
    ...kit,
    college: kit.college as CollegeId,
    createdAt: kit.createdAt.toISOString(),
  }));
}
