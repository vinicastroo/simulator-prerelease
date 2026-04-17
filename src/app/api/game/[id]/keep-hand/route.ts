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
      const otherPlayerId = isHost ? room.guestPlayerId : room.hostPlayerId;
      if (!playerId || !otherPlayerId) return { error: "PLAYER_NOT_FOUND" };

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
              handSizeByPlayerId: mulligan.handSizeByPlayerId,
              mulliganCountByPlayerId: mulligan.mulliganCountByPlayerId,
            }
          : {
              stage: "mulligan",
              keptPlayerIds,
              handSizeByPlayerId: mulligan.handSizeByPlayerId,
              mulliganCountByPlayerId: mulligan.mulliganCountByPlayerId,
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
      const updated = await prisma.gameRoom.updateMany({
        where: {
          id: roomId,
          stateVersion: room.stateVersion,
          status: "ACTIVE",
        },
        data: {
          gameState: normalizedState as object,
          stateVersion: nextVersion,
        },
      });

      if (updated.count > 0) {
        return {
          nextState: normalizedState,
          nextVersion,
          winnerId,
          rollDurationMs: winnerId ? FIRST_PLAYER_ROLL_DURATION_MS : 0,
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

  const batchEvents: Parameters<typeof pusherServer.triggerBatch>[0] = [
    {
      channel: `game-${roomId}`,
      name: "state-updated",
      data: JSON.stringify({ stateVersion: result.nextVersion }),
    },
  ];
  if (result.winnerId) {
    batchEvents.push({
      channel: `game-${roomId}`,
      name: "first-player-roll-started",
      data: JSON.stringify({ winnerId: result.winnerId, durationMs: result.rollDurationMs }),
    });
  }
  await pusherServer.triggerBatch(batchEvents);

  return NextResponse.json({ ok: true });
}
