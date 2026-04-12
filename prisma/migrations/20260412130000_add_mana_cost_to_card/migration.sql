ALTER TABLE "Card"
ADD COLUMN "manaCost" TEXT,
ADD COLUMN "setName" TEXT,
ADD COLUMN "oracleText" TEXT,
ADD COLUMN "flavorText" TEXT,
ADD COLUMN "power" TEXT,
ADD COLUMN "toughness" TEXT,
ADD COLUMN "loyalty" TEXT,
ADD COLUMN "artist" TEXT,
ADD COLUMN "releasedAt" TEXT,
ADD COLUMN "rawData" JSONB;
