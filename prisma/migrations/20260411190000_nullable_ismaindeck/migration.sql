-- Make isMainDeck nullable (null = unassigned/canvas-only)
ALTER TABLE "PlacedCard" ALTER COLUMN "isMainDeck" DROP NOT NULL;
ALTER TABLE "PlacedCard" ALTER COLUMN "isMainDeck" DROP DEFAULT;

-- Reset all existing cards to unassigned (none were intentionally placed in a deck)
UPDATE "PlacedCard" SET "isMainDeck" = NULL WHERE "isMainDeck" = FALSE;
