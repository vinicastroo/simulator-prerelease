/**
 * Exporta todas as cartas do banco para scripts/cards-backup.json
 * Uso: pnpm tsx scripts/backup-cards.ts
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function backup() {
  console.log("📦 Exportando cartas do banco...");

  const cards = await prisma.card.findMany({
    orderBy: { scryfallId: "asc" },
  });

  if (cards.length === 0) {
    console.log("⚠️  Nenhuma carta encontrada no banco.");
    return;
  }

  const dest = path.resolve(__dirname, "cards-backup.json");
  fs.writeFileSync(dest, JSON.stringify(cards, null, 2), "utf-8");

  console.log(`✅ ${cards.length} cartas exportadas → ${dest}`);
}

backup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
