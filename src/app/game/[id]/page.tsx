import { notFound } from "next/navigation";
import ReactDOM from "react-dom";
import { requireSessionUser } from "@/lib/auth-session";
import type { GameState } from "@/lib/game/types";
import { prisma } from "@/lib/prisma";
import { GameRoomPage } from "./GameRoomPage";

type Props = { params: Promise<{ id: string }> };

export default async function GamePage({ params }: Props) {
  const user = await requireSessionUser();
  const { id: roomId } = await params;

  const roomInclude = {
    hostUser: { select: { id: true, name: true } },
    guestUser: { select: { id: true, name: true } },
    hostKit: { select: { id: true, college: true } },
    guestKit: { select: { id: true, college: true } },
  } as const;

  let room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: roomInclude,
  });

  if (!room) notFound();

  let isHost = room.hostUserId === user.id;
  let isGuest = room.guestUserId === user.id;
  let isNew = !isHost && !isGuest;

  // Room is full — neither host nor guest
  if (isNew && room.guestUserId !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] p-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 text-center">
          <h1 className="text-xl font-bold text-white">Sala cheia</h1>
          <p className="mt-2 text-sm text-white/50">
            Esta sala já está com 2 jogadores.
          </p>
        </div>
      </div>
    );
  }

  // Register as guest
  if (isNew) {
    const joined = await prisma.gameRoom.updateMany({
      where: { id: roomId, guestUserId: null },
      data: { guestUserId: user.id },
    });

    if (joined.count === 0) {
      room = await prisma.gameRoom.findUnique({
        where: { id: roomId },
        include: roomInclude,
      });

      if (!room) notFound();

      if (room.guestUserId !== user.id) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] p-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 text-center">
              <h1 className="text-xl font-bold text-white">Sala cheia</h1>
              <p className="mt-2 text-sm text-white/50">
                Esta sala ja esta com 2 jogadores.
              </p>
            </div>
          </div>
        );
      }
    } else {
      room = await prisma.gameRoom.findUnique({
        where: { id: roomId },
        include: roomInclude,
      });

      if (!room) notFound();
    }

    isHost = room.hostUserId === user.id;
    isGuest = room.guestUserId === user.id;
    isNew = !isHost && !isGuest;
  }

  // Preload all card images so the browser fetches them in parallel with
  // hydration — by the time cards are played they're already in cache.
  if (room.status === "ACTIVE" && room.gameState) {
    const gs = room.gameState as unknown as GameState;
    for (const def of Object.values(gs.cardDefinitions)) {
      if (def.imageUrl) {
        ReactDOM.preload(def.imageUrl, { as: "image" });
      }
    }
  }

  const kits =
    room.status === "ACTIVE"
      ? []
      : await prisma.prereleaseKit.findMany({
          where: { userId: user.id },
          select: { id: true, college: true },
          orderBy: { createdAt: "desc" },
        });

  const myRole = isHost ? "host" : "guest";
  const myPlayerId = isHost ? room.hostPlayerId : room.guestPlayerId;

  return (
    <GameRoomPage
      roomId={roomId}
      status={room.status}
      myRole={myRole}
      myUserId={user.id}
      myPlayerId={myPlayerId}
      myKitId={isHost ? room.hostKitId : room.guestKitId}
      hostUser={room.hostUser}
      guestUser={room.guestUser}
      hostReady={room.hostReady}
      guestReady={room.guestReady}
      hostKit={room.hostKit}
      guestKit={room.guestKit}
      kits={kits}
      gameState={room.status === "ACTIVE" ? room.gameState : null}
      stateVersion={room.stateVersion}
    />
  );
}
