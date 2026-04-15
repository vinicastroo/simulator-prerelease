/**
 * Restaura cartas a partir de scripts/cards-backup.json
 * Uso: pnpm tsx scripts/restore-cards.ts
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function restore() {
  const src = path.resolve(__dirname, "cards-backup.json");

  if (!fs.existsSync(src)) {
    console.error(`❌ Backup não encontrado: ${src}`);
    console.error("   Rode primeiro: pnpm db:backup");
    process.exit(1);
  }

  const cards = JSON.parse(fs.readFileSync(src, "utf-8")) as Record<string, unknown>[];
  console.log(`📥 Restaurando ${cards.length} cartas...`);

  let inserted = 0;
  let skipped = 0;

  for (const card of cards) {
    const scryfallId = card.scryfallId as string;

    await prisma.card.upsert({
      where: { scryfallId },
      update: card as never,
      create: card as never,
    });

    const exists = await prisma.card.findUnique({
      where: { scryfallId },
      select: { id: true },
    });

    if (exists) skipped++;
    else inserted++;

    process.stdout.write(`\r♻️  ${inserted + skipped}/${cards.length}`);
  }

  console.log(`\n✅ Restauração concluída — ${cards.length} cartas no banco.`);
}

restore()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
