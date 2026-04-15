-- CreateEnum
CREATE TYPE "GameRoomStatus" AS ENUM ('WAITING', 'LOBBY', 'READY', 'ACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "GameRoom" (
    "id" TEXT NOT NULL,
    "status" "GameRoomStatus" NOT NULL DEFAULT 'WAITING',
    "stateVersion" INTEGER NOT NULL DEFAULT 0,
    "hostUserId" TEXT NOT NULL,
    "hostKitId" TEXT,
    "hostPlayerId" TEXT,
    "hostReady" BOOLEAN NOT NULL DEFAULT false,
    "guestUserId" TEXT,
    "guestKitId" TEXT,
    "guestPlayerId" TEXT,
    "guestReady" BOOLEAN NOT NULL DEFAULT false,
    "gameState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_guestUserId_fkey" FOREIGN KEY ("guestUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_hostKitId_fkey" FOREIGN KEY ("hostKitId") REFERENCES "PrereleaseKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_guestKitId_fkey" FOREIGN KEY ("guestKitId") REFERENCES "PrereleaseKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
