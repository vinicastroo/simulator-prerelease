import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient, Rarity } from "@prisma/client";
import axios from "axios";

import { Pool } from "pg";
import type { ScryfallSearchResponse } from "../types/scryfall";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const QUERIES = [
  'https://api.scryfall.com/cards/search?q=e:sos+((cn>=1+cn<=266)+OR+cn:"272"+OR+cn:"273"+OR+cn:"274"+OR+cn:"275"+OR+cn:"276"+OR+cn:"277"+OR+cn:"278"+OR+cn:"279"+OR+cn:"280"+OR+cn:"281")',
  "https://api.scryfall.com/cards/search?q=set:SOA,spg+date=sos",
];

const awsRegion = process.env.AWS_REGION;
const s3Bucket = process.env.AWS_S3_BUCKET;
const cloudFrontBaseUrl = process.env.AWS_CLOUDFRONT_BASE_URL?.replace(
  /\/$/,
  "",
);
const useS3 = Boolean(awsRegion && s3Bucket);

const s3Client = useS3
  ? new S3Client({
      region: awsRegion,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    })
  : null;

function getPreferredImageUri(
  card: ScryfallSearchResponse["data"][number],
): { url: string; extension: "png" | "jpg" } | null {
  const imageUris = card.image_uris ?? card.card_faces?.[0]?.image_uris;
  if (!imageUris) return null;

  if (imageUris?.png) return { url: imageUris.png, extension: "png" };
  if (imageUris?.large) return { url: imageUris.large, extension: "jpg" };
  if (imageUris?.normal) return { url: imageUris.normal, extension: "jpg" };
  return null;
}

function getPublicImageUrl(key: string): string {
  if (cloudFrontBaseUrl) return `${cloudFrontBaseUrl}/${key}`;
  if (!s3Bucket || !awsRegion)
    throw new Error(
      "AWS_S3_BUCKET e AWS_REGION são obrigatórios para gerar URL do bucket",
    );
  return `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/${key}`;
}

async function downloadImageLocally(
  url: string,
  scryfallId: string,
  extension: "png" | "jpg",
): Promise<string> {
  const directory = path.resolve(__dirname, "../public/cards");
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

  const dest = path.join(directory, `${scryfallId}.${extension}`);
  if (fs.existsSync(dest)) return `/cards/${scryfallId}.${extension}`;

  const response = await axios({ url, responseType: "stream" });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on("finish", () => resolve(`/cards/${scryfallId}.${extension}`));
    writer.on("error", reject);
  });
}

async function uploadImageToS3(
  url: string,
  scryfallId: string,
  extension: "png" | "jpg",
): Promise<string> {
  if (!s3Client || !s3Bucket) {
    throw new Error("S3 não configurado");
  }

  const key = `cards/${scryfallId}.${extension}`;
  const response = await axios<ArrayBuffer>({
    url,
    responseType: "arraybuffer",
  });
  const body = Buffer.from(response.data);
  const contentType = extension === "png" ? "image/png" : "image/jpeg";

  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return getPublicImageUrl(key);
}

async function storeImage(
  url: string,
  scryfallId: string,
  extension: "png" | "jpg",
): Promise<string> {
  if (useS3) {
    return uploadImageToS3(url, scryfallId, extension);
  }

  return downloadImageLocally(url, scryfallId, extension);
}

function mapRarity(rarity: string): Rarity {
  const r = rarity.toUpperCase();
  if (r === "MYTHIC") return Rarity.MYTHIC;
  if (r === "RARE") return Rarity.RARE;
  if (r === "UNCOMMON") return Rarity.UNCOMMON;
  return Rarity.COMMON;
}

async function fetchAndSeed(): Promise<void> {
  console.log("🚀 Iniciando importação segura...");
  console.log(
    useS3
      ? "☁️ Upload configurado para S3/CloudFront"
      : "💾 Upload local em public/cards",
  );

  for (const query of QUERIES) {
    let nextUrl: string | null = query;

    while (nextUrl) {
      try {
        const { data }: { data: ScryfallSearchResponse } =
          await axios.get(nextUrl);

        for (const card of data.data) {
          const preferredImage = getPreferredImageUri(card);
          if (!preferredImage) continue;

          console.log(`📥 [${card.set.toUpperCase()}] ${card.name}`);
          const existingCard = await prisma.card.findUnique({
            where: { scryfallId: card.id },
            select: { imagePath: true },
          });

          let imagePath: string;
          if (existingCard?.imagePath) {
            imagePath = existingCard.imagePath;
            console.log(`♻️ Reutilizando imagem existente para ${card.name}`);
          } else {
            console.log(`☁️ Armazenando nova imagem para ${card.name}`);
            imagePath = await storeImage(
              preferredImage.url,
              card.id,
              preferredImage.extension,
            );
          }

          await prisma.card.upsert({
            where: { scryfallId: card.id },
            update: {
              name: card.name,
              rarity: mapRarity(card.rarity),
              set: card.set.toUpperCase(),
              setName: card.set_name || null,
              colors: card.colors || card.color_identity || [],
              manaCost: card.mana_cost || null,
              cmc: Math.floor(card.cmc || 0),
              typeLine: card.type_line,
              oracleText: card.oracle_text || null,
              flavorText: card.flavor_text || null,
              power: card.power || null,
              toughness: card.toughness || null,
              loyalty: card.loyalty || null,
              artist: card.artist || null,
              releasedAt: card.released_at || null,
              imagePath,
              collectorNumber: card.collector_number,
              rawData: card as unknown as Prisma.InputJsonValue,
            },
            create: {
              scryfallId: card.id,
              name: card.name,
              rarity: mapRarity(card.rarity),
              set: card.set.toUpperCase(),
              setName: card.set_name || null,
              colors: card.colors || card.color_identity || [],
              manaCost: card.mana_cost || null,
              cmc: Math.floor(card.cmc || 0),
              typeLine: card.type_line,
              oracleText: card.oracle_text || null,
              flavorText: card.flavor_text || null,
              power: card.power || null,
              toughness: card.toughness || null,
              loyalty: card.loyalty || null,
              artist: card.artist || null,
              releasedAt: card.released_at || null,
              imagePath,
              collectorNumber: card.collector_number,
              rawData: card as unknown as Prisma.InputJsonValue,
            },
          });

          await new Promise((r) => setTimeout(r, 100)); // Rate limit
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
