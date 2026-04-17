-- GIN trigram index on name (may already exist from manual SQL)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "Card_name_trgm_idx" ON "Card" USING gin (name gin_trgm_ops);

-- GIN JSONB index on colors (may already exist from manual SQL)
CREATE INDEX IF NOT EXISTS "Card_colors_gin_idx" ON "Card" USING gin (colors jsonb_path_ops);

-- B-tree indexes on Card
CREATE INDEX IF NOT EXISTS "Card_set_idx" ON "Card"("set");
CREATE INDEX IF NOT EXISTS "Card_name_idx" ON "Card"("name");

-- B-tree index on PlacedCard.kitId
CREATE INDEX IF NOT EXISTS "PlacedCard_kitId_idx" ON "PlacedCard"("kitId");

-- B-tree indexes on PrereleaseKit
CREATE INDEX IF NOT EXISTS "PrereleaseKit_userId_idx" ON "PrereleaseKit"("userId");
CREATE INDEX IF NOT EXISTS "PrereleaseKit_userId_createdAt_idx" ON "PrereleaseKit"("userId", "createdAt");

-- B-tree indexes on GameRoom
CREATE INDEX IF NOT EXISTS "GameRoom_hostUserId_idx" ON "GameRoom"("hostUserId");
CREATE INDEX IF NOT EXISTS "GameRoom_guestUserId_idx" ON "GameRoom"("guestUserId");
CREATE INDEX IF NOT EXISTS "GameRoom_hostKitId_idx" ON "GameRoom"("hostKitId");
CREATE INDEX IF NOT EXISTS "GameRoom_guestKitId_idx" ON "GameRoom"("guestKitId");
CREATE INDEX IF NOT EXISTS "GameRoom_status_idx" ON "GameRoom"("status");
