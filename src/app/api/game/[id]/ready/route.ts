import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePlayerId } from "@/lib/game/ids";
import { createInitialGameState } from "@/lib/game/initial-state";
import type { GameState } from "@/lib/game/types";
import { kitToGameData } from "@/lib/mtg/kit-to-game";
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

  const updated = await prisma.$transaction(async (tx) => {
    const room = await tx.gameRoom.findUnique({
      where: { id: roomId },
      include: {
        hostUser: { select: { id: true, name: true } },
        guestUser: { select: { id: true, name: true } },
        hostKit: {
          include: {
            placedCards: {
              include: {
                card: {
                  select: {
                    id: true,
                    name: true,
                    imagePath: true,
                    manaCost: true,
                    typeLine: true,
                    oracleText: true,
                    power: true,
                    toughness: true,
                  },
                },
              },
            },
          },
        },
        guestKit: {
          include: {
            placedCards: {
              include: {
                card: {
                  select: {
                    id: true,
                    name: true,
                    imagePath: true,
                    manaCost: true,
                    typeLine: true,
                    oracleText: true,
                    power: true,
                    toughness: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!room) throw new Error("NOT_FOUND");

    const isHost = room.hostUserId === userId;
    const isGuest = room.guestUserId === userId;
    if (!isHost && !isGuest) throw new Error("FORBIDDEN");

    const data = isHost ? { hostReady: true } : { guestReady: true };
    const next = await tx.gameRoom.update({ where: { id: roomId }, data });

    const hostReady = isHost ? true : room.hostReady;
    const guestReady = isGuest ? true : room.guestReady;
    const bothReady =
      hostReady &&
      guestReady &&
      room.guestUserId !== null &&
      next.status !== "ACTIVE";

    if (!bothReady) return { room: next, gameState: null };

    // Generate stable player IDs stored in GameRoom
    const hostPlayerId = room.hostPlayerId ?? generatePlayerId();
    const guestPlayerId = room.guestPlayerId ?? generatePlayerId();

    const hostName = room.hostUser.name;
    const guestName = room.guestUser?.name ?? "Oponente";

    const baseState = createInitialGameState([
      { id: hostPlayerId, name: hostName },
      { id: guestPlayerId, name: guestName },
    ]);

    // Inject host deck
    let gameState: GameState = baseState;
    if (room.hostKit) {
      const { definitions, instances } = kitToGameData(
        room.hostKit.placedCards.map((pc) => ({
          id: pc.id,
          isMainDeck: pc.isMainDeck,
          card: pc.card,
        })),
        hostPlayerId,
      );
      const defs = Object.fromEntries(definitions.map((d) => [d.id, d]));
      const insts = Object.fromEntries(instances.map((i) => [i.id, i]));
      const libraryIds = instances
        .filter((i) => i.zone === "library")
        .map((i) => i.id);
      const sideboardIds = instances
        .filter((i) => i.zone === "sideboard")
        .map((i) => i.id);
      gameState = {
        ...gameState,
        cardDefinitions: { ...gameState.cardDefinitions, ...defs },
        cardInstances: { ...gameState.cardInstances, ...insts },
        players: {
          ...gameState.players,
          [hostPlayerId]: {
            ...gameState.players[hostPlayerId]!,
            zones: {
              ...gameState.players[hostPlayerId]!.zones,
              library: libraryIds,
              sideboard: sideboardIds,
            },
          },
        },
      };
    }

    // Inject guest deck
    if (room.guestKit) {
      const { definitions, instances } = kitToGameData(
        room.guestKit.placedCards.map((pc) => ({
          id: pc.id,
          isMainDeck: pc.isMainDeck,
          card: pc.card,
        })),
        guestPlayerId,
      );
      const defs = Object.fromEntries(definitions.map((d) => [d.id, d]));
      const insts = Object.fromEntries(instances.map((i) => [i.id, i]));
      const libraryIds = instances
        .filter((i) => i.zone === "library")
        .map((i) => i.id);
      const sideboardIds = instances
        .filter((i) => i.zone === "sideboard")
        .map((i) => i.id);
      gameState = {
        ...gameState,
        cardDefinitions: { ...gameState.cardDefinitions, ...defs },
        cardInstances: { ...gameState.cardInstances, ...insts },
        players: {
          ...gameState.players,
          [guestPlayerId]: {
            ...gameState.players[guestPlayerId]!,
            zones: {
              ...gameState.players[guestPlayerId]!.zones,
              library: libraryIds,
              sideboard: sideboardIds,
            },
          },
        },
      };
    }

    await tx.gameRoom.update({
      where: { id: roomId },
      data: {
        status: "ACTIVE",
        hostPlayerId,
        guestPlayerId,
        gameState: gameState as object,
        stateVersion: 1,
      },
    });

    return { room: next, gameState };
  });

  const channel = `game-${roomId}`;

  if (updated.gameState) {
    await Promise.all([
      pusherServer.trigger(channel, "game-started", {
        gameState: updated.gameState,
      }),
      // Remove room from public lobby list
      pusherServer.trigger("lobby", "room-closed", { id: roomId }),
    ]);
  } else {
    const role = updated.room.hostUserId === userId ? "host" : "guest";
    await pusherServer.trigger(channel, "player-ready", { role });
  }

  return NextResponse.json({ ok: true });
}
