import { notFound, redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { GameRoomPage } from "./GameRoomPage";

type Props = { params: Promise<{ id: string }> };

export default async function GamePage({ params }: Props) {
  const user = await requireSessionUser();
  const { id: roomId } = await params;

  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: {
      hostUser: { select: { id: true, name: true } },
      guestUser: { select: { id: true, name: true } },
      hostKit: { select: { id: true, college: true } },
      guestKit: { select: { id: true, college: true } },
    },
  });

  if (!room) notFound();

  const isHost = room.hostUserId === user.id;
  const isGuest = room.guestUserId === user.id;
  const isNew = !isHost && !isGuest;

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
    await prisma.gameRoom.update({
      where: { id: roomId },
      data: { guestUserId: user.id },
    });
    // Redirect to same page so re-fetch picks up updated room
    redirect(`/game/${roomId}`);
  }

  const kits = await prisma.prereleaseKit.findMany({
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
