import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePlayerId } from "@/lib/game/ids";
import { createInitialGameState } from "@/lib/game/initial-state";
import type { GameState } from "@/lib/game/types";
import { kitToGameData } from "@/lib/mtg/kit-to-game";
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
      hostKit: { include: { placedCards: { include: { card: { select: cardSelect } } } } },
      guestKit: { include: { placedCards: { include: { card: { select: cardSelect } } } } },
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
    const data = isHost ? { hostReady: true } : { guestReady: true };
    await tx.gameRoom.update({ where: { id: roomId }, data });

    // Re-read to see concurrent ready updates
    const fresh = await tx.gameRoom.findUnique({
      where: { id: roomId },
      select: { hostReady: true, guestReady: true, guestUserId: true, status: true },
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
    const hostPlayerId = room.hostPlayerId ?? generatePlayerId();
    const guestPlayerId = room.guestPlayerId ?? generatePlayerId();

    const baseState = createInitialGameState([
      { id: hostPlayerId, name: room.hostUser.name },
      { id: guestPlayerId, name: room.guestUser?.name ?? "Oponente" },
    ]);

    let gameState: GameState = baseState;

    if (room.hostKit) {
      const { definitions, instances } = kitToGameData(
        room.hostKit.placedCards.map((pc) => ({ id: pc.id, isMainDeck: pc.isMainDeck, card: pc.card })),
        hostPlayerId,
      );
      const hostPlayer = gameState.players[hostPlayerId];
      if (!hostPlayer) throw new Error("HOST_PLAYER_NOT_FOUND");
      gameState = {
        ...gameState,
        cardDefinitions: { ...gameState.cardDefinitions, ...Object.fromEntries(definitions.map((d) => [d.id, d])) },
        cardInstances: { ...gameState.cardInstances, ...Object.fromEntries(instances.map((i) => [i.id, i])) },
        players: {
          ...gameState.players,
          [hostPlayerId]: {
            ...hostPlayer,
            zones: {
              ...hostPlayer.zones,
              library: instances.filter((i) => i.zone === "library").map((i) => i.id),
              sideboard: instances.filter((i) => i.zone === "sideboard").map((i) => i.id),
            },
          },
        },
      };
    }

    if (room.guestKit) {
      const { definitions, instances } = kitToGameData(
        room.guestKit.placedCards.map((pc) => ({ id: pc.id, isMainDeck: pc.isMainDeck, card: pc.card })),
        guestPlayerId,
      );
      const guestPlayer = gameState.players[guestPlayerId];
      if (!guestPlayer) throw new Error("GUEST_PLAYER_NOT_FOUND");
      gameState = {
        ...gameState,
        cardDefinitions: { ...gameState.cardDefinitions, ...Object.fromEntries(definitions.map((d) => [d.id, d])) },
        cardInstances: { ...gameState.cardInstances, ...Object.fromEntries(instances.map((i) => [i.id, i])) },
        players: {
          ...gameState.players,
          [guestPlayerId]: {
            ...guestPlayer,
            zones: {
              ...guestPlayer.zones,
              library: instances.filter((i) => i.zone === "library").map((i) => i.id),
              sideboard: instances.filter((i) => i.zone === "sideboard").map((i) => i.id),
            },
          },
        },
      };
    }

    await prisma.gameRoom.update({
      where: { id: roomId },
      data: { hostPlayerId, guestPlayerId, gameState: gameState as object, stateVersion: 1 },
    });

    await Promise.all([
      pusherServer.trigger(channel, "game-started", { gameState }),
      pusherServer.trigger("lobby", "room-closed", { id: roomId }),
    ]);
  } else {
    const role = isHost ? "host" : "guest";
    await pusherServer.trigger(channel, "player-ready", { role });
  }

  return NextResponse.json({ ok: true });
}
