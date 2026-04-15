import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { GameAction } from "@/lib/game/actions";
import { gameReducer } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(
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
  const action: GameAction = body.action;
  const clientVersion: number = body.stateVersion;

  if (!action?.type) {
    return NextResponse.json({ error: "action required" }, { status: 400 });
  }

  // card/ping is UI-only — skip DB write and broadcast directly
  if (action.type === "card/ping") {
    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      select: { hostUserId: true, guestUserId: true, status: true },
    });
    if (!room || room.status !== "ACTIVE") {
      return NextResponse.json({ error: "GAME_NOT_ACTIVE" }, { status: 409 });
    }
    if (room.hostUserId !== userId && room.guestUserId !== userId) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    await pusherServer.trigger(`game-${roomId}`, "game-action", {
      action,
      actorUserId: userId,
    });
    return NextResponse.json({ ok: true });
  }

  const result = await prisma
    .$transaction(async (tx) => {
      const room = await tx.gameRoom.findUnique({ where: { id: roomId } });
      if (!room) throw new Error("NOT_FOUND");
      if (room.status !== "ACTIVE") throw new Error("GAME_NOT_ACTIVE");

      const isHost = room.hostUserId === userId;
      const isGuest = room.guestUserId === userId;
      if (!isHost && !isGuest) throw new Error("FORBIDDEN");

      // Optimistic lock — reject if client version is stale
      if (clientVersion !== undefined && clientVersion !== room.stateVersion) {
        throw new Error("VERSION_CONFLICT");
      }

      const currentState = room.gameState as unknown as GameState;
      const actorPlayerId = isHost ? room.hostPlayerId : room.guestPlayerId;

      if (!actorPlayerId || !currentState.players[actorPlayerId]) {
        throw new Error("PLAYER_NOT_FOUND");
      }

      if (
        action.type === "turn/passTurn" &&
        currentState.activePlayerId !== actorPlayerId
      ) {
        throw new Error("NOT_ACTIVE_PLAYER");
      }

      const nextState = gameReducer(currentState, action);
      const nextVersion = room.stateVersion + 1;

      await tx.gameRoom.update({
        where: { id: roomId },
        data: { gameState: nextState as object, stateVersion: nextVersion },
      });

      return { nextVersion, actorPlayerId };
    })
    .catch((err: Error) => {
      return { error: err.message };
    });

  if ("error" in result) {
    const status =
      result.error === "NOT_FOUND"
        ? 404
        : result.error === "FORBIDDEN"
          ? 403
          : result.error === "NOT_ACTIVE_PLAYER"
            ? 409
            : result.error === "VERSION_CONFLICT"
              ? 409
              : result.error === "GAME_NOT_ACTIVE"
                ? 409
                : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  await pusherServer.trigger(`game-${roomId}`, "game-action", {
    action,
    actorUserId: userId,
    seq: result.nextVersion,
  });

  return NextResponse.json({ ok: true, seq: result.nextVersion });
}
