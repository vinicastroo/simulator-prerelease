import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const kit = await prisma.prereleaseKit.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (kit.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove child records that block the delete due to FK constraints
  await prisma.placedCard.deleteMany({ where: { kitId: id } });
  await prisma.gameRoom.updateMany({
    where: { hostKitId: id },
    data: { hostKitId: null },
  });
  await prisma.gameRoom.updateMany({
    where: { guestKitId: id },
    data: { guestKitId: null },
  });

  await prisma.prereleaseKit.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
