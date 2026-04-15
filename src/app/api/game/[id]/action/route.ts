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

  // card/ping is UI-only — skip DB write, broadcast immediately (session already validates user)
  if (action.type === "card/ping") {
    await pusherServer.trigger(`game-${roomId}`, "game-action", {
      action,
      actorUserId: userId,
    });
    return NextResponse.json({ ok: true, seq: clientVersion ?? null });
  }

  const result = await (async () => {
    const room = await prisma.gameRoom.findUnique({ where: { id: roomId } });
    if (!room) return { error: "NOT_FOUND" };
    if (room.status !== "ACTIVE") return { error: "GAME_NOT_ACTIVE" };

    const isHost = room.hostUserId === userId;
    const isGuest = room.guestUserId === userId;
    if (!isHost && !isGuest) return { error: "FORBIDDEN" };

    if (clientVersion !== undefined && clientVersion !== room.stateVersion) {
      return { error: "VERSION_CONFLICT" };
    }

    const currentState = room.gameState as unknown as GameState;
    const actorPlayerId = isHost ? room.hostPlayerId : room.guestPlayerId;

    if (!actorPlayerId || !currentState.players[actorPlayerId]) {
      return { error: "PLAYER_NOT_FOUND" };
    }

    if (
      action.type === "turn/passTurn" &&
      currentState.activePlayerId !== actorPlayerId
    ) {
      return { error: "NOT_ACTIVE_PLAYER" };
    }

    const nextState = gameReducer(currentState, action);
    const nextVersion = room.stateVersion + 1;
    const updated = await prisma.gameRoom.updateMany({
      where: { id: roomId, stateVersion: room.stateVersion, status: "ACTIVE" },
      data: { gameState: nextState as object, stateVersion: nextVersion },
    });

    if (updated.count === 0) {
      return { error: "VERSION_CONFLICT" };
    }

    return { nextVersion, actorPlayerId };
  })();

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
