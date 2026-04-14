import type { CardDefinition } from "@/lib/game/types";
import type { DeckCard } from "./deck-schema";
import { fetchCardsByNames, getCardImageUrl } from "./scryfall";
import { generateCardDefId } from "@/lib/game/ids";

/**
 * Build CardDefinitions from deck cards that are missing data,
 * using Scryfall as fallback for missing fields.
 */
export async function buildDefinitionsWithFallback(
  cards: DeckCard[],
): Promise<Map<string, CardDefinition>> {
  const result = new Map<string, CardDefinition>();

  // Cards that need Scryfall data (missing imageUrl or type)
  const needsFetch = cards.filter((c) => !c.imageUrl || !c.type);

  const uniqueNames = [...new Set(needsFetch.map((c) => c.name))];
  const scryfallMap =
    uniqueNames.length > 0 ? await fetchCardsByNames(uniqueNames) : new Map();

  for (const card of cards) {
    // One definition per unique card name
    if (result.has(card.name)) continue;

    const scryfall = scryfallMap.get(card.name.toLowerCase());

    const def: CardDefinition = {
      id: generateCardDefId(),
      sourceId: scryfall?.id ?? card.scryfallId ?? card.name,
      name: card.name,
      imageUrl: card.imageUrl ?? (scryfall ? getCardImageUrl(scryfall) : null),
      manaCost: card.manaCost ?? scryfall?.mana_cost ?? null,
      type: card.type ?? scryfall?.type_line ?? "Unknown",
      oracleText: card.oracleText ?? scryfall?.oracle_text ?? null,
      power: card.power ?? scryfall?.power ?? null,
      toughness: card.toughness ?? scryfall?.toughness ?? null,
    };

    result.set(card.name, def);
  }

  return result;
}
