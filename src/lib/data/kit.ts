import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Fetches a prerelease kit with all placed cards.
 *
 * Wrapped with React.cache so a single request (e.g. generateMetadata +
 * page component) only hits the database once regardless of how many times
 * the function is called with the same arguments.
 */
export const fetchKitWithCards = cache(async (kitId: string) => {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.prereleaseKit.findFirst({
    where: {
      id: kitId,
      userId: session.user.id,
    },
    include: {
      placedCards: {
        include: {
          card: {
            // rawData holds the full Scryfall JSON (~3-5 KB/card × 80+ cards).
            // It is never rendered in the simulator or playtest — omitting it
            // cuts the query payload by ~80% and is the main latency source.
            omit: { rawData: true },
          },
        },
        orderBy: { zIndex: "asc" },
      },
    },
  });
});
