import { z } from "zod";

export const DeckCardSchema = z.object({
  count: z.number().int().min(1),
  name: z.string().min(1),
  /** Optional Scryfall ID or similar */
  scryfallId: z.string().optional(),
  /** Direct image URL (must be allowed host or relative path) */
  imageUrl: z.string().url().optional().nullable(),
  manaCost: z.string().optional().nullable(),
  type: z.string().optional(),
  oracleText: z.string().optional().nullable(),
  power: z.string().optional().nullable(),
  toughness: z.string().optional().nullable(),
  sideboard: z.boolean().optional().default(false),
});

export type DeckCard = z.infer<typeof DeckCardSchema>;

export const DeckSchema = z.object({
  name: z.string().optional(),
  format: z.string().optional(),
  cards: z.array(DeckCardSchema).min(1),
});

export type DeckJson = z.infer<typeof DeckSchema>;

/** Allowed hosts for deck source URLs (S3/CloudFront) */
export const ALLOWED_DECK_HOSTS: string[] = (() => {
  const env = process.env.NEXT_PUBLIC_ALLOWED_DECK_HOSTS ?? "";
  const from_env = env
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return from_env.length > 0 ? from_env : [];
})();

export function isAllowedDeckUrl(url: string): boolean {
  if (ALLOWED_DECK_HOSTS.length === 0) return true; // dev: allow all
  try {
    const { hostname } = new URL(url);
    return ALLOWED_DECK_HOSTS.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}
