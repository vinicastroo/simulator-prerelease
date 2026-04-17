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
    <div className="relative min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />
      <div className="pointer-events-none absolute right-[380px] top-[35%] h-[260px] w-[260px] rounded-full bg-[#2563eb] opacity-20 blur-[90px]" />

      <div className="relative flex min-h-screen w-full flex-col px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="pb-5">
          <TopNav activePage="game" />
          <div className="mt-8 mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
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

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              {myActiveRoom && (
                <Link
                  href={`/game/${myActiveRoom.id}`}
                  className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-green-300 transition-colors hover:bg-green-500/20"
                >
                  ↩ Continuar partida
                </Link>
              )}
              {myOpenRoom ? (
                <Link
                  href={`/game/${myOpenRoom.id}`}
                  className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300 transition-colors hover:bg-cyan-500/20"
                >
                  Minha sala
                </Link>
              ) : null}
              <NewRoomButton createRoom={createRoom} />
            </div>
          </div>
        </header>

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
