import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { NewGameForm } from "./NewGameForm";

export default async function NewGamePage() {
  const user = await requireSessionUser();

  const kits = await prisma.prereleaseKit.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      college: true,
      createdAt: true,
      promoCard: { select: { name: true } },
      _count: { select: { placedCards: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] p-4">
      <NewGameForm kits={kits} createRoom={createRoom} />
    </div>
  );
}
