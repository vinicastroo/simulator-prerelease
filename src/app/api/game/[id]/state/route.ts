import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const isHost = room.hostUserId === userId;
  const isGuest = room.guestUserId === userId;
  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    gameState: room.gameState,
    stateVersion: room.stateVersion,
    status: room.status,
    hostPlayerId: room.hostPlayerId,
    guestPlayerId: room.guestPlayerId,
    hostReady: room.hostReady,
    guestReady: room.guestReady,
    myRole: isHost ? "host" : "guest",
  });
}
