import { generateCardInstanceId } from "@/lib/game/ids";
import type { CardDefinition, CardInstance } from "@/lib/game/types";
import type { DeckJson } from "./deck-schema";

export type NormalizedDeck = {
  definitions: CardDefinition[];
  instances: CardInstance[];
};

/**
 * Given resolved CardDefinitions and the deck JSON,
 * produce the instances list with correct counts and zones.
 */
export function normalizeDeck(
  deckJson: DeckJson,
  definitions: Map<string, CardDefinition>,
  playerId: string,
): NormalizedDeck {
  const defs: CardDefinition[] = [];
  const instances: CardInstance[] = [];

  const seenDefs = new Set<string>();

  for (const card of deckJson.cards) {
    const def = definitions.get(card.name);
    if (!def) continue;

    if (!seenDefs.has(def.id)) {
      defs.push(def);
      seenDefs.add(def.id);
    }

    const zone: CardInstance["zone"] = card.sideboard ? "sideboard" : "library";

    for (let i = 0; i < card.count; i++) {
      const inst: CardInstance = {
        id: generateCardInstanceId(),
        definitionId: def.id,
        ownerId: playerId,
        controllerId: playerId,
        zone,
        tapped: false,
        faceDown: false,
        counters: {},
        isToken: false,
        customName: null,
        tokenData: null,
        battlefield: null,
      };
      instances.push(inst);
    }
  }

  return { definitions: defs, instances };
}
