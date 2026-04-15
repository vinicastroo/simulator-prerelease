import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await prisma.gameRoom.create({
    data: { hostUserId: session.user.id },
    select: { id: true },
  });

  await pusherServer.trigger("lobby", "room-opened", { id: room.id });

  return NextResponse.json({ id: room.id }, { status: 201 });
}
