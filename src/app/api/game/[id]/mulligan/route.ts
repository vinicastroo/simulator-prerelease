import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { gameReducer } from "@/lib/game/reducer";
import { getGameSetup, getPlayerMulliganCount } from "@/lib/game/setup";
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
          id: true,
          status: true,
          stateVersion: true,
          hostUserId: true,
          guestUserId: true,
          hostPlayerId: true,
          guestPlayerId: true,
          gameState: true,
          hostUser: { select: { name: true } },
          guestUser: { select: { name: true } },
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

      const nextMulliganCount =
        getPlayerMulliganCount(currentState, playerId) + 1;
      const shuffled = shuffleCardIds(nextLibraryIds);
      const nextHandSize = Math.min(7, shuffled.length);
      nextState = gameReducer(nextState, {
        type: "zone/shuffle",
        playerId,
        zone: "library",
        orderedIds: shuffled,
      });
      if (nextHandSize > 0) {
        nextState = gameReducer(nextState, {
          type: "card/draw",
          playerId,
          count: nextHandSize,
        });
      }

      nextState = {
        ...nextState,
        setup: {
          mulligan: {
            ...setup.mulligan,
            handSizeByPlayerId: {
              ...setup.mulligan.handSizeByPlayerId,
              [playerId]: nextHandSize,
            },
            mulliganCountByPlayerId: {
              ...setup.mulligan.mulliganCountByPlayerId,
              [playerId]: nextMulliganCount,
            },
          },
        },
      };

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
        return {
          nextState,
          nextVersion,
          playerName:
            playerId === room.hostPlayerId
              ? room.hostUser.name
              : (room.guestUser?.name ?? "Oponente"),
          mulliganCount: nextMulliganCount,
        };
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
  await pusherServer.trigger(`game-${roomId}`, "player-mulliganed", {
    playerName: result.playerName,
    count: result.mulliganCount,
  });

  return NextResponse.json({ ok: true });
}
