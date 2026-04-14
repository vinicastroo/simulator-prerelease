const SCRYFALL_BASE = "https://api.scryfall.com";

export type ScryfallCard = {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    normal?: string;
    large?: string;
    small?: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line?: string;
    oracle_text?: string;
    power?: string;
    toughness?: string;
    image_uris?: { normal?: string; large?: string; small?: string };
  }>;
};

/**
 * Fetch a single card by exact name.
 * Uses /cards/named?exact=<name>
 */
export async function fetchCardByName(
  name: string,
): Promise<ScryfallCard | null> {
  try {
    const url = `${SCRYFALL_BASE}/cards/named?exact=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as ScryfallCard;
  } catch {
    return null;
  }
}

/**
 * Fetch multiple cards by name using Scryfall collection endpoint.
 * Batches up to 75 names per request.
 */
export async function fetchCardsByNames(
  names: string[],
): Promise<Map<string, ScryfallCard>> {
  const result = new Map<string, ScryfallCard>();
  const unique = [...new Set(names)];

  const BATCH_SIZE = 75;
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const identifiers = batch.map((name) => ({ name }));

    try {
      const res = await fetch(`${SCRYFALL_BASE}/cards/collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ identifiers }),
      });

      if (!res.ok) continue;

      const data = (await res.json()) as {
        data: ScryfallCard[];
        not_found: unknown[];
      };
      for (const card of data.data) {
        result.set(card.name.toLowerCase(), card);
      }
    } catch {
      // ignore batch error, fallback handles individual cards
    }
  }

  return result;
}

export function getCardImageUrl(card: ScryfallCard): string | null {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.image_uris?.large) return card.image_uris.large;
  if (card.card_faces?.[0]?.image_uris?.normal) {
    return card.card_faces[0].image_uris.normal;
  }
  return null;
}
