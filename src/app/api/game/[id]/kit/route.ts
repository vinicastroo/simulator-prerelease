import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId } = await params;
  const body = await req.json();
  const kitId: string | undefined = body.kitId;

  if (!kitId) {
    return NextResponse.json({ error: "kitId required" }, { status: 400 });
  }

  const room = await prisma.gameRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const isHost = room.hostUserId === userId;
  const isGuest = room.guestUserId === userId;

  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify the kit belongs to this user
  const kit = await prisma.prereleaseKit.findFirst({
    where: { id: kitId, userId },
  });
  if (!kit) {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 });
  }

  if (isHost) {
    await prisma.gameRoom.update({
      where: { id: roomId },
      data: { hostKitId: kitId },
    });
  } else {
    await prisma.gameRoom.update({
      where: { id: roomId },
      data: { guestKitId: kitId },
    });
  }

  return NextResponse.json({ ok: true });
}
