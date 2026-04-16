import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { NewRoomButton } from "@/features/game/components/NewRoomButton";
import { RoomListClient } from "@/features/game/components/RoomListClient";
import { requireSessionUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

function collegeLabel(college: string) {
  return college.charAt(0) + college.slice(1).toLowerCase();
}

export default async function GameListPage() {
  const user = await requireSessionUser();

  const [rooms, myActiveRoom, myOpenRoom] = await Promise.all([
    prisma.gameRoom.findMany({
      where: { status: "WAITING", guestUserId: null },
      include: {
        hostUser: { select: { id: true, name: true } },
        hostKit: { select: { college: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.gameRoom.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ hostUserId: user.id }, { guestUserId: user.id }],
      },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.gameRoom.findFirst({
      where: { hostUserId: user.id, status: "WAITING", guestUserId: null },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  async function createRoom() {
    "use server";
    const sessionUser = await requireSessionUser();
    const room = await prisma.gameRoom.create({
      data: { hostUserId: sessionUser.id },
      select: { id: true },
    });
    await pusherServer.trigger("lobby", "room-opened", { id: room.id });
    redirect(`/game/${room.id}`);
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="pb-5">
          <TopNav activePage="game" />
          <div className="mt-4 flex items-center justify-end gap-3">
            {myActiveRoom && (
              <Link
                href={`/game/${myActiveRoom.id}`}
                className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-green-300 hover:bg-green-500/20 transition-colors"
              >
                ↩ Continuar partida
              </Link>
            )}
            {myOpenRoom ? (
              <Link
                href={`/game/${myOpenRoom.id}`}
                className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                Minha sala
              </Link>
            ) : null}
            <NewRoomButton createRoom={createRoom} />
          </div>
        </header>

        {/* Title */}
        <div className="mt-8 mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#91a7da]">
            Multiplayer
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
            Salas abertas
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Escolha uma sala para entrar ou crie a sua.
          </p>
        </div>

        {/* Live-updating list */}
        <RoomListClient
          initialRooms={rooms.map((r) => ({
            id: r.id,
            hostName: r.hostUser.name,
            hostCollege: r.hostKit ? collegeLabel(r.hostKit.college) : null,
            createdAt: r.createdAt.toISOString(),
            isOwn: r.hostUserId === user.id,
          }))}
          newRoomButton={
            <NewRoomButton
              createRoom={createRoom}
              className="mt-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.08] transition-colors"
            />
          }
        />
      </div>
    </div>
  );
}
