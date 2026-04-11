"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Persists position + zIndex after a drag gesture.
 * No revalidatePath — optimistic updates already reflect the UI.
 * The server state will be consistent on next full navigation.
 */
export async function updateCardPosition(
  placedCardId: string,
  posX: number,
  posY: number,
  zIndex: number,
  kitId: string
) {
  await prisma.placedCard.update({
    where: { id: placedCardId },
    data: { posX, posY, zIndex },
  });

  revalidatePath(`/simulator/${kitId}`);
}

export async function updateMultiplePositions(
  updates: { id: string; posX: number; posY: number; zIndex: number }[],
  kitId: string
) {
  await prisma.$transaction(
    updates.map(({ id, posX, posY, zIndex }) =>
      prisma.placedCard.update({
        where: { id },
        data: { posX, posY, zIndex },
      })
    )
  );
  revalidatePath(`/simulator/${kitId}`);
}

/**
 * Assigns one or more cards to a deck zone.
 * zone = true  → main deck
 * zone = false → sideboard
 * zone = null  → remove from both (card back to canvas-only)
 */
export async function setDeckZone(
  ids: string[],
  zone: boolean | null,
  kitId: string,
) {
  await prisma.$transaction(
    ids.map((id) =>
      prisma.placedCard.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { isMainDeck: zone as any },
      })
    )
  );
  revalidatePath(`/simulator/${kitId}`);
}

export async function getKitWithCards(kitId: string) {
  return prisma.prereleaseKit.findUnique({
    where: { id: kitId },
    include: {
      placedCards: {
        include: { card: true },
        orderBy: { zIndex: "asc" },
      },
    },
  });
}

export async function createKit(college: string) {
  const validColleges = [
    "LOREHOLD",
    "PRISMARI",
    "QUANDRIX",
    "SILVERQUILL",
    "WITHERBLOOM",
  ] as const;
  if (!validColleges.includes(college as (typeof validColleges)[number])) {
    throw new Error("Invalid college");
  }
  return prisma.prereleaseKit.create({
    data: { college: college as (typeof validColleges)[number] },
  });
}
