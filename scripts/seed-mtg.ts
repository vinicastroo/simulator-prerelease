import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ScryfallSearchResponse } from '../types/scryfall';
import { PrismaClient, Rarity } from '../src/generated/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const QUERIES = [
  'https://api.scryfall.com/cards/search?q=e:sos+((cn>=1+cn<=266)+OR+cn:"272"+OR+cn:"273"+OR+cn:"274"+OR+cn:"275"+OR+cn:"276"+OR+cn:"277"+OR+cn:"278"+OR+cn:"279"+OR+cn:"280"+OR+cn:"281")',
  'https://api.scryfall.com/cards/search?q=set:SOA,spg+date=sos'
];

async function downloadImage(url: string, scryfallId: string): Promise<string> {
  const directory = path.resolve(__dirname, '../public/cards');
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

  const dest = path.join(directory, `${scryfallId}.jpg`);
  if (fs.existsSync(dest)) return `/cards/${scryfallId}.jpg`;

  const response = await axios({ url, responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(`/cards/${scryfallId}.jpg`));
    writer.on('error', reject);
  });
}

function mapRarity(rarity: string): Rarity {
  const r = rarity.toUpperCase();
  if (r === 'MYTHIC') return Rarity.MYTHIC;
  if (r === 'RARE') return Rarity.RARE;
  if (r === 'UNCOMMON') return Rarity.UNCOMMON;
  return Rarity.COMMON;
}

async function fetchAndSeed(): Promise<void> {
  console.log("🚀 Iniciando importação segura...");

  for (const query of QUERIES) {
    let nextUrl: string | null = query;

    while (nextUrl) {
      try {
        const { data }: { data: ScryfallSearchResponse } = await axios.get(nextUrl);

        for (const card of data.data) {
          const imageUri = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
          if (!imageUri) continue;

          console.log(`📥 [${card.set.toUpperCase()}] ${card.name}`);
          const localPath = await downloadImage(imageUri, card.id);

          await prisma.card.upsert({
            where: { scryfallId: card.id },
            update: {},
            create: {
              scryfallId: card.id,
              name: card.name,
              rarity: mapRarity(card.rarity),
              set: card.set.toUpperCase(),
              colors: card.colors || card.color_identity || [],
              cmc: Math.floor(card.cmc || 0),
              typeLine: card.type_line,
              imagePath: localPath,
              collectorNumber: card.collector_number,
            },
          });

          await new Promise(r => setTimeout(r, 100)); // Rate limit
        }
        nextUrl = data.has_more && data.next_page ? data.next_page : null;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("❌ Erro na API Scryfall:", error.message);
        } else {
          console.error("❌ Erro inesperado:", error);
        }
        nextUrl = null;
      }
    }
  }
}

fetchAndSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());