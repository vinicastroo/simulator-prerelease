-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'MYTHIC');

-- CreateEnum
CREATE TYPE "CardSet" AS ENUM ('SOS', 'SOA', 'SPG');

-- CreateEnum
CREATE TYPE "College" AS ENUM ('LOREHOLD', 'PRISMARI', 'QUANDRIX', 'SILVERQUILL', 'WITHERBLOOM');

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scryfallId" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "set" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "cmc" INTEGER NOT NULL,
    "typeLine" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "collectorNumber" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrereleaseKit" (
    "id" TEXT NOT NULL,
    "college" "College" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promoCardId" TEXT,

    CONSTRAINT "PrereleaseKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacedCard" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "isMainDeck" BOOLEAN NOT NULL DEFAULT false,
    "isFoil" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlacedCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_scryfallId_key" ON "Card"("scryfallId");

-- AddForeignKey
ALTER TABLE "PrereleaseKit" ADD CONSTRAINT "PrereleaseKit_promoCardId_fkey" FOREIGN KEY ("promoCardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacedCard" ADD CONSTRAINT "PlacedCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacedCard" ADD CONSTRAINT "PlacedCard_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "PrereleaseKit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
