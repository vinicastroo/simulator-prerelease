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

  const result = await prisma
    .$transaction(async (tx) => {
      const room = await tx.gameRoom.findUnique({ where: { id: roomId } });
      if (!room) throw new Error("NOT_FOUND");
      if (room.status !== "ACTIVE") throw new Error("GAME_NOT_ACTIVE");

      const isHost = room.hostUserId === userId;
      const isGuest = room.guestUserId === userId;
      if (!isHost && !isGuest) throw new Error("FORBIDDEN");

      const playerId = isHost ? room.hostPlayerId : room.guestPlayerId;
      if (!playerId) throw new Error("PLAYER_NOT_FOUND");

      const currentState = room.gameState as unknown as GameState;
      const player = currentState.players[playerId];
      if (!player) throw new Error("PLAYER_NOT_FOUND");

      const setup = getGameSetup(currentState);
      if (setup.mulligan.stage !== "mulligan") {
        return { nextState: currentState, nextVersion: room.stateVersion };
      }

      const handIds = [...player.zones.hand];
      const nextLibraryIds = [...player.zones.library, ...handIds];
      if (nextLibraryIds.length === 0) {
        return { nextState: currentState, nextVersion: room.stateVersion };
      }

      let nextState = currentState;
      if (handIds.length > 0) {
        nextState = gameReducer(nextState, {
          type: "card/moveMany",
          cardIds: handIds,
          to: "library",
          toPlayerId: playerId,
        });
      }

      const drawCount = Math.max(0, handIds.length - 1);
      const shuffled = shuffleCardIds(nextLibraryIds);
      nextState = gameReducer(nextState, {
        type: "zone/shuffle",
        playerId,
        zone: "library",
        orderedIds: shuffled,
      });
      if (drawCount > 0) {
        nextState = gameReducer(nextState, {
          type: "card/draw",
          playerId,
          count: drawCount,
        });
      }

      const nextVersion = room.stateVersion + 1;
      await tx.gameRoom.update({
        where: { id: roomId },
        data: { gameState: nextState as object, stateVersion: nextVersion },
      });

      return { nextState, nextVersion };
    })
    .catch((error: Error) => ({ error: error.message }));

  if ("error" in result) {
    const status =
      result.error === "NOT_FOUND"
        ? 404
        : result.error === "FORBIDDEN"
          ? 403
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
