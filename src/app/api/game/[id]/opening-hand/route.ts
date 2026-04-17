import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { gameReducer } from "@/lib/game/reducer";
import { getGameSetup } from "@/lib/game/setup";
import { shuffleCardIds } from "@/lib/game/shuffle";
import type { GameState } from "@/lib/game/types";
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

  const result = await (async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const room = await prisma.gameRoom.findUnique({
        where: { id: roomId },
        select: {
          status: true,
          hostUserId: true,
          guestUserId: true,
          hostPlayerId: true,
          guestPlayerId: true,
          gameState: true,
          stateVersion: true,
        },
      });
      if (!room) return { error: "NOT_FOUND" };
      if (room.status !== "ACTIVE") return { error: "GAME_NOT_ACTIVE" };

      const isHost = room.hostUserId === userId;
      const isGuest = room.guestUserId === userId;
      if (!isHost && !isGuest) return { error: "FORBIDDEN" };

      const playerId = isHost ? room.hostPlayerId : room.guestPlayerId;
      if (!playerId) return { error: "PLAYER_NOT_FOUND" };

      const currentState = room.gameState as unknown as GameState;
      const player = currentState.players[playerId];
      if (!player) return { error: "PLAYER_NOT_FOUND" };

      const setup = getGameSetup(currentState);
      if (setup.mulligan.stage !== "mulligan") {
        return { nextState: currentState, nextVersion: room.stateVersion };
      }

      if (player.zones.hand.length > 0 || player.zones.library.length === 0) {
        return { nextState: currentState, nextVersion: room.stateVersion };
      }

      const drawCount = Math.min(7, player.zones.library.length);
      const shuffled = shuffleCardIds(player.zones.library);
      let nextState = gameReducer(currentState, {
        type: "zone/shuffle",
        playerId,
        zone: "library",
        orderedIds: shuffled,
      });
      nextState = gameReducer(nextState, {
        type: "card/draw",
        playerId,
        count: drawCount,
      });

      const nextVersion = room.stateVersion + 1;
      const updated = await prisma.gameRoom.updateMany({
        where: {
          id: roomId,
          stateVersion: room.stateVersion,
          status: "ACTIVE",
        },
        data: { gameState: nextState as object, stateVersion: nextVersion },
      });

      if (updated.count > 0) {
        return { nextState, nextVersion };
      }
    }

    return { error: "VERSION_CONFLICT" };
  })();

  if ("error" in result) {
    const status =
      result.error === "NOT_FOUND"
        ? 404
        : result.error === "FORBIDDEN"
          ? 403
          : result.error === "VERSION_CONFLICT"
            ? 409
            : result.error === "GAME_NOT_ACTIVE"
              ? 409
              : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  await pusherServer.trigger(`game-${roomId}`, "state-updated", {
    stateVersion: result.nextVersion,
  });

  return NextResponse.json({ ok: true });
}
