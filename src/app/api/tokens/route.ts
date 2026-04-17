import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tokens = await prisma.card.findMany({
    where: { set: "TSOS" },
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
  });

  return NextResponse.json(tokens, {
    headers: { "Cache-Control": "no-store" },
  });
}
