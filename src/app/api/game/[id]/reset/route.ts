import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildRoomGameState } from "@/lib/game/build-room-game-state";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId } = await params;
  const userId = session.user.id;

  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    select: { hostUserId: true, guestUserId: true, status: true },
  });

  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (room.status !== "ACTIVE") {
    return NextResponse.json({ error: "GAME_NOT_ACTIVE" }, { status: 409 });
  }

  const isHost = room.hostUserId === userId;
  const isGuest = room.guestUserId === userId;
  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Either player cancelling aborts the entire vote — reset both flags.
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: { hostReady: false, guestReady: false },
  });

  await pusherServer.trigger(`game-${roomId}`, "reset-vote-updated", {
    hostReady: false,
    guestReady: false,
  });

  return NextResponse.json({ ok: true });
}

const cardSelect = {
  id: true,
  name: true,
  imagePath: true,
  manaCost: true,
  typeLine: true,
  oracleText: true,
  power: true,
  toughness: true,
} as const;

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

  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: {
      hostUser: { select: { id: true, name: true } },
      guestUser: { select: { id: true, name: true } },
      hostKit: {
        include: {
          placedCards: { include: { card: { select: cardSelect } } },
        },
      },
      guestKit: {
        include: {
          placedCards: { include: { card: { select: cardSelect } } },
        },
      },
    },
  });

  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (room.status !== "ACTIVE") {
    return NextResponse.json({ error: "GAME_NOT_ACTIVE" }, { status: 409 });
  }

  const isHost = room.hostUserId === userId;
  const isGuest = room.guestUserId === userId;
  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const channel = `game-${roomId}`;

  const result = await prisma.$transaction(async (tx) => {
    await tx.gameRoom.update({
      where: { id: roomId },
      data: isHost ? { hostReady: true } : { guestReady: true },
    });

    const fresh = await tx.gameRoom.findUnique({
      where: { id: roomId },
      select: {
        status: true,
        stateVersion: true,
        hostReady: true,
        guestReady: true,
      },
    });

    if (!fresh || fresh.status !== "ACTIVE") {
      throw new Error("GAME_NOT_ACTIVE");
    }

    if (!fresh.hostReady || !fresh.guestReady) {
      return {
        resetClaimed: false,
        hostReady: fresh.hostReady,
        guestReady: fresh.guestReady,
      };
    }

    const claim = await tx.gameRoom.updateMany({
      where: {
        id: roomId,
        status: "ACTIVE",
        hostReady: true,
        guestReady: true,
      },
      data: { hostReady: false, guestReady: false },
    });

    return {
      resetClaimed: claim.count > 0,
      hostReady: false,
      guestReady: false,
      nextVersion: fresh.stateVersion + 1,
    };
  });

  if (!result.resetClaimed) {
    await pusherServer.trigger(channel, "reset-vote-updated", {
      hostReady: result.hostReady,
      guestReady: result.guestReady,
    });
    return NextResponse.json({ ok: true, reset: false });
  }

  const { gameState, hostPlayerId, guestPlayerId } = buildRoomGameState({
    hostPlayerId: room.hostPlayerId,
    guestPlayerId: room.guestPlayerId,
    hostUserName: room.hostUser.name,
    guestUserName: room.guestUser?.name ?? null,
    hostKit: room.hostKit,
    guestKit: room.guestKit,
  });

  await prisma.gameRoom.update({
    where: { id: roomId },
    data: {
      hostPlayerId,
      guestPlayerId,
      hostReady: false,
      guestReady: false,
      gameState: gameState as object,
      stateVersion: result.nextVersion,
    },
  });

  await pusherServer.triggerBatch([
    {
      channel,
      name: "state-updated",
      data: JSON.stringify({ stateVersion: result.nextVersion }),
    },
    {
      channel,
      name: "reset-vote-updated",
      data: JSON.stringify({ hostReady: false, guestReady: false }),
    },
  ]);

  return NextResponse.json({ ok: true, reset: true });
}
