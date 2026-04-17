import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildRoomGameState } from "@/lib/game/build-room-game-state";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

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

  // ── 1. Fetch room + kit data OUTSIDE the transaction ─────────────────────
  // Heavy query (kit cards) must not hold a DB lock — it would blow the
  // 5 s interactive-transaction timeout before the atomic writes even run.
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: {
      hostUser: { select: { id: true, name: true } },
      guestUser: { select: { id: true, name: true } },
      hostKit: {
        include: { placedCards: { include: { card: { select: cardSelect } } } },
      },
      guestKit: {
        include: { placedCards: { include: { card: { select: cardSelect } } } },
      },
    },
  });

  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isHost = room.hostUserId === userId;
  const isGuest = room.guestUserId === userId;
  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── 2. Short transaction: mark ready + claim ACTIVE atomically ────────────
  // Only fast DB writes here — no kit data queries, no CPU-heavy work.
  const claimed = await prisma.$transaction(async (tx) => {
    // Guard: read current status before touching ready flags.
    // If the game is already ACTIVE (e.g. a player somehow calls /ready again
    // after missing the game-started Pusher event), we must NOT set hostReady /
    // guestReady — those fields double as reset-vote flags in-game and a stale
    // `true` value would cause the reset dialog to open for the other player.
    const current = await tx.gameRoom.findUnique({
      where: { id: roomId },
      select: { status: true },
    });
    if (current?.status === "ACTIVE") return false;

    const data = isHost ? { hostReady: true } : { guestReady: true };
    await tx.gameRoom.update({ where: { id: roomId }, data });

    // Re-read to see concurrent ready updates
    const fresh = await tx.gameRoom.findUnique({
      where: { id: roomId },
      select: {
        hostReady: true,
        guestReady: true,
        guestUserId: true,
        status: true,
      },
    });

    const bothReady =
      !!fresh?.hostReady &&
      !!fresh?.guestReady &&
      fresh.guestUserId !== null &&
      fresh.status !== "ACTIVE";

    if (!bothReady) return false;

    // Atomically claim activation — only one concurrent request wins
    const result = await tx.gameRoom.updateMany({
      where: { id: roomId, status: { not: "ACTIVE" } },
      data: { status: "ACTIVE" },
    });

    return result.count > 0;
  });

  const channel = `game-${roomId}`;

  // ── 3. If we won the claim, build and save game state ─────────────────────
  if (claimed) {
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
        stateVersion: 1,
      },
    });

    await pusherServer.triggerBatch([
      { channel, name: "game-started", data: JSON.stringify({}) },
      { channel: "lobby", name: "room-closed", data: JSON.stringify({ id: roomId }) },
    ]);
  } else {
    const role = isHost ? "host" : "guest";
    await pusherServer.trigger(channel, "player-ready", { role });
  }

  return NextResponse.json({ ok: true });
}
