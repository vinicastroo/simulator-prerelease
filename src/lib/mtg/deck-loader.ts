import { DeckSchema, isAllowedDeckUrl } from "./deck-schema";
import { buildDefinitionsWithFallback } from "./card-fallback";
import { normalizeDeck } from "./deck-normalize";
import type { NormalizedDeck } from "./deck-normalize";

export type DeckLoadResult =
  | { ok: true; deck: NormalizedDeck; name?: string }
  | { ok: false; error: string };

/**
 * Load and normalize a deck from a URL.
 * URL must be from an allowed host (S3/CloudFront) unless in dev mode.
 */
export async function loadDeckFromUrl(
  url: string,
  playerId: string,
): Promise<DeckLoadResult> {
  if (!isAllowedDeckUrl(url)) {
    return {
      ok: false,
      error: "URL de deck não permitida. Use apenas S3/CloudFront.",
    };
  }

  let json: unknown;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { ok: false, error: `Falha ao buscar deck (HTTP ${res.status}).` };
    }
    json = await res.json();
  } catch (e) {
    return { ok: false, error: `Erro de rede ao carregar deck: ${String(e)}` };
  }

  const parsed = DeckSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message).join("; ");
    return { ok: false, error: `JSON do deck inválido: ${issues}` };
  }

  const deckJson = parsed.data;

  let definitions: Awaited<ReturnType<typeof buildDefinitionsWithFallback>>;
  try {
    definitions = await buildDefinitionsWithFallback(deckJson.cards);
  } catch (e) {
    return { ok: false, error: `Erro ao resolver cartas: ${String(e)}` };
  }

  const deck = normalizeDeck(deckJson, definitions, playerId);

  return { ok: true, deck, name: deckJson.name };
}

/**
 * Load and normalize a deck from a raw JSON string (for testing / paste input).
 */
export async function loadDeckFromJson(
  jsonString: string,
  playerId: string,
): Promise<DeckLoadResult> {
  let json: unknown;
  try {
    json = JSON.parse(jsonString);
  } catch {
    return { ok: false, error: "JSON inválido." };
  }

  const parsed = DeckSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message).join("; ");
    return { ok: false, error: `JSON do deck inválido: ${issues}` };
  }

  const deckJson = parsed.data;
  const definitions = await buildDefinitionsWithFallback(deckJson.cards);
  const deck = normalizeDeck(deckJson, definitions, playerId);

  return { ok: true, deck, name: deckJson.name };
}

/**
 * Returns the default deck URL from env, if configured.
 */
export function getDefaultDeckUrl(): string | null {
  return process.env.NEXT_PUBLIC_DEFAULT_DECK_URL ?? null;
}
