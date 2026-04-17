import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDecksForUser } from "@/app/decks/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kits = await getDecksForUser(session.user.id);
  return NextResponse.json(kits, {
    headers: { "Cache-Control": "no-store" },
  });
}
