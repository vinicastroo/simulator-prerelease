-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "isToken" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Card_isToken_name_idx" ON "Card"("isToken", "name");
