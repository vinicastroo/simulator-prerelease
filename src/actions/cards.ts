"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

type BasicLandName = "Plains" | "Island" | "Swamp" | "Mountain" | "Forest";

async function assertKitOwnership(kitId: string, userId: string) {
  const kit = await prisma.prereleaseKit.findFirst({
    where: {
      id: kitId,
      userId,
    },
    select: { id: true },
  });

  if (!kit) {
    throw new Error("Kit not found");
  }
}

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
  const userId = await requireSessionUserId();
  await assertKitOwnership(kitId, userId);

  const result = await prisma.placedCard.updateMany({
    where: { id: placedCardId, kitId },
    data: { posX, posY, zIndex },
  });

  if (result.count === 0) {
    throw new Error("Placed card not found");
  }

  revalidatePath(`/simulator/${kitId}`);
}

export async function updateMultiplePositions(
  updates: { id: string; posX: number; posY: number; zIndex: number }[],
  kitId: string,
) {
  const userId = await requireSessionUserId();
  await assertKitOwnership(kitId, userId);

  await prisma.$transaction(
    updates.map(({ id, posX, posY, zIndex }) =>
      prisma.placedCard.updateMany({
        where: { id, kitId },
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
  const userId = await requireSessionUserId();
  await assertKitOwnership(kitId, userId);

  await prisma.$transaction(
    ids.map((id) =>
      prisma.placedCard.updateMany({
        where: { id, kitId },
        data: { isMainDeck: { set: zone } },
      }),
    ),
  );
  revalidatePath(`/simulator/${kitId}`);
}

export async function getKitWithCards(kitId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.prereleaseKit.findFirst({
    where: {
      id: kitId,
      userId: session.user.id,
    },
    include: {
      placedCards: {
        include: { card: true },
        orderBy: { zIndex: "asc" },
      },
    },
  });
}

export async function createKit(college: string) {
  const userId = await requireSessionUserId();
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
    data: { college: college as (typeof validColleges)[number], userId },
  });
}

export async function addBasicLandsToKit(
  kitId: string,
  landName: BasicLandName,
  quantity: number,
  zone: boolean | null = true,
) {
  const userId = await requireSessionUserId();
  await assertKitOwnership(kitId, userId);

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
