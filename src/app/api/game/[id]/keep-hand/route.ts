import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGameSetup, withGameSetup } from "@/lib/game/setup";
import type { GameState } from "@/lib/game/types";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

const FIRST_PLAYER_ROLL_DURATION_MS = 2400;

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
      const otherPlayerId = isHost ? room.guestPlayerId : room.hostPlayerId;
      if (!playerId || !otherPlayerId) throw new Error("PLAYER_NOT_FOUND");

      const currentState = room.gameState as unknown as GameState;
      const setup = getGameSetup(currentState);
      const mulligan = setup.mulligan;

      if (mulligan.stage !== "mulligan") {
        return {
          nextState: currentState,
          nextVersion: room.stateVersion,
          winnerId: null,
          rollDurationMs: 0,
        };
      }

      const keptPlayerIds = mulligan.keptPlayerIds.includes(playerId)
        ? mulligan.keptPlayerIds
        : [...mulligan.keptPlayerIds, playerId];

      const bothKept =
        keptPlayerIds.includes(playerId) &&
        keptPlayerIds.includes(otherPlayerId);

      const winnerId = bothKept
        ? Math.random() < 0.5
          ? playerId
          : otherPlayerId
        : null;

      const nextState = withGameSetup(currentState, {
        mulligan: winnerId
          ? {
              stage: "ready",
              keptPlayerIds,
              firstPlayerId: winnerId,
            }
          : {
              stage: "mulligan",
              keptPlayerIds,
            },
      });

      const normalizedState = winnerId
        ? {
            ...nextState,
            playerOrder:
              nextState.playerOrder[0] === winnerId
                ? nextState.playerOrder
                : [
                    winnerId,
                    ...nextState.playerOrder.filter((id) => id !== winnerId),
                  ],
            activePlayerId: winnerId,
            priorityPlayerId: winnerId,
            turnNumber: 1,
          }
        : nextState;

      const nextVersion = room.stateVersion + 1;

      await tx.gameRoom.update({
        where: { id: roomId },
        data: {
          gameState: normalizedState as object,
          stateVersion: nextVersion,
        },
      });

      return {
        nextState: normalizedState,
        nextVersion,
        winnerId,
        rollDurationMs: winnerId ? FIRST_PLAYER_ROLL_DURATION_MS : 0,
      };
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

  if (result.winnerId) {
    await pusherServer.trigger(`game-${roomId}`, "first-player-roll-started", {
      winnerId: result.winnerId,
      durationMs: result.rollDurationMs,
    });
  }

  return NextResponse.json({ ok: true });
}
