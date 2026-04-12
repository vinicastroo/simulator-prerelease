"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type BasicLandName = "Plains" | "Island" | "Swamp" | "Mountain" | "Forest";

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
  kitId: string,
) {
  await prisma.placedCard.update({
    where: { id: placedCardId },
    data: { posX, posY, zIndex },
  });

  revalidatePath(`/simulator/${kitId}`);
}

export async function updateMultiplePositions(
  updates: { id: string; posX: number; posY: number; zIndex: number }[],
  kitId: string,
) {
  await prisma.$transaction(
    updates.map(({ id, posX, posY, zIndex }) =>
      prisma.placedCard.update({
        where: { id },
        data: { posX, posY, zIndex },
      }),
    ),
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
        data: { isMainDeck: { set: zone } },
      }),
    ),
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

export async function addBasicLandsToKit(
  kitId: string,
  landName: BasicLandName,
  quantity: number,
  zone: boolean | null = true,
) {
  const normalizedQuantity = Math.max(1, Math.min(20, Math.floor(quantity)));

  const landCard = await prisma.card.findFirst({
    where: {
      name: landName,
      typeLine: { contains: "Basic Land" },
    },
    orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
  });

  if (!landCard) {
    throw new Error(`Basic land not found: ${landName}`);
  }

  const { _max } = await prisma.placedCard.aggregate({
    where: { kitId },
    _max: { zIndex: true },
  });

  const startingZIndex = (_max.zIndex ?? 0) + 1;

  const createdCards = await prisma.$transaction(
    Array.from({ length: normalizedQuantity }, (_, index) =>
      prisma.placedCard.create({
        data: {
          kitId,
          cardId: landCard.id,
          posX: -9999,
          posY: -9999,
          zIndex: startingZIndex + index,
          isMainDeck: zone,
          isFoil: false,
        },
        include: { card: true },
      }),
    ),
  );

  revalidatePath(`/simulator/${kitId}`);
  return createdCards;
}
