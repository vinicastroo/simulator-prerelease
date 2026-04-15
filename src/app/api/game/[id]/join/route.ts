import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId } = await params;
  const userId = session.user.id;

  const room = await prisma.gameRoom.findUnique({ where: { id: roomId } });
  if (!room || room.guestUserId !== userId) {
    return NextResponse.json({ ok: true }); // silently ignore
  }

  await pusherServer.trigger(`game-${roomId}`, "player-joined", {
    userId,
    name: session.user.name ?? "Convidado",
  });

  // Remove this room from the public lobby list
  await pusherServer.trigger("lobby", "room-closed", { id: roomId });

  return NextResponse.json({ ok: true });
}
