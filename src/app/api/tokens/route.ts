import { type NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q")?.trim() ?? "";
  const colorsParam = searchParams.get("colors") ?? "";
  const subtype = searchParams.get("subtype") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const scryfallIdsParam = searchParams.get("scryfallIds") ?? "";
  const scryfallIds = scryfallIdsParam ? scryfallIdsParam.split(",").filter(Boolean) : [];

  const selectedColors = colorsParam
    ? colorsParam.split(",").filter(Boolean)
    : [];

  const andClauses: Prisma.CardWhereInput[] = [
    { isToken: true },
  ];

  // When filtering to deck-related tokens only
  if (scryfallIds.length > 0) {
    andClauses.push({ scryfallId: { in: scryfallIds } });
  }

  if (q) {
    andClauses.push({ name: { contains: q, mode: "insensitive" } });
  }

  if (selectedColors.length > 0) {
    const colorClauses: Prisma.CardWhereInput[] = selectedColors
      .filter((c) => c !== "C")
      .map((c) => ({ colors: { array_contains: [c] } }));

    if (selectedColors.includes("C")) {
      colorClauses.push({ colors: { equals: [] } });
    }

    andClauses.push({ OR: colorClauses });
  }

  if (subtype !== "all") {
    if (subtype === "emblem") {
      andClauses.push({ typeLine: { contains: "Emblem", mode: "insensitive" } });
    } else if (subtype === "creature") {
      andClauses.push({ typeLine: { contains: "Creature", mode: "insensitive" } });
    } else if (subtype === "artifact") {
      andClauses.push({
        AND: [
          { typeLine: { contains: "Artifact", mode: "insensitive" } },
          { NOT: { typeLine: { contains: "Creature", mode: "insensitive" } } },
        ],
      });
    } else if (subtype === "enchantment") {
      andClauses.push({ typeLine: { contains: "Enchantment", mode: "insensitive" } });
    }
  }

  const where: Prisma.CardWhereInput = { AND: andClauses };

  const [total, tokens] = await Promise.all([
    prisma.card.count({ where }),
    prisma.card.findMany({
      where,
      select: {
        id: true,
        scryfallId: true,
        name: true,
        typeLine: true,
        power: true,
        toughness: true,
        loyalty: true,
        colors: true,
        manaCost: true,
        oracleText: true,
        imagePath: true,
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json(
    { tokens, total, page, totalPages: Math.ceil(total / PAGE_SIZE) },
    {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
