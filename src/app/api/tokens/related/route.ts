import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ScryfallRelatedCard = {
  object: string;
  id: string;
  component: string;
  name: string;
  type_line: string;
  uri: string;
};

export async function GET(req: NextRequest) {
  const cardIds =
    req.nextUrl.searchParams.get("cardIds")?.split(",").filter(Boolean) ?? [];

  if (cardIds.length === 0) {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds } },
    select: { rawData: true },
  });

  const tokenScryfallIds = new Set<string>();

  for (const card of cards) {
    const raw = card.rawData as Record<string, unknown> | null;
    const allParts = raw?.all_parts as ScryfallRelatedCard[] | undefined;
    if (!Array.isArray(allParts)) continue;
    for (const part of allParts) {
      if (part.component === "token" || part.component === "emblem") {
        tokenScryfallIds.add(part.id);
      }
    }
  }

  return NextResponse.json(Array.from(tokenScryfallIds), {
    headers: {
      "Cache-Control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
