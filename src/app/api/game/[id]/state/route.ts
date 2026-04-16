import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { GameState } from "@/lib/game/types";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId } = await params;
  const userId = session.user.id;

  const body = await req.json();
  const { gameState, stateVersion } = body as {
    gameState: GameState;
    stateVersion: number;
  };

  const room = await prisma.gameRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (room.status !== "ACTIVE") {
    return NextResponse.json({ error: "Not active" }, { status: 409 });
  }

  const isHost = room.hostUserId === userId;
  const isGuest = room.guestUserId === userId;
  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const nextVersion = stateVersion + 1;
  const updated = await prisma.gameRoom.updateMany({
    where: { id: roomId, stateVersion, status: "ACTIVE" },
    data: { gameState: gameState as object, stateVersion: nextVersion },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "VERSION_CONFLICT" }, { status: 409 });
  }

  await pusherServer.trigger(`game-${roomId}`, "state-push", {
    stateVersion: nextVersion,
    actorUserId: userId,
  });

  return NextResponse.json({ ok: true, seq: nextVersion });
}
