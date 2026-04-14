import type { CardDefinition, CardInstance } from "@/lib/game/types";
import { generateCardDefId, generateCardInstanceId } from "@/lib/game/ids";

type KitCard = {
  id: string;
  isMainDeck: boolean | null;
  card: {
    id: string;
    name: string;
    imagePath: string;
    manaCost: string | null;
    typeLine: string;
    oracleText: string | null;
    power: string | null;
    toughness: string | null;
  };
};

export type KitGameData = {
  definitions: CardDefinition[];
  instances: CardInstance[];
};

/**
 * Converts PlacedCard[] from the prerelease kit into
 * CardDefinition[] + CardInstance[] for the game engine.
 *
 * - isMainDeck === true  → library
 * - isMainDeck === false → sideboard
 * - isMainDeck === null  → skipped (canvas-only, not in deck)
 */
export function kitToGameData(
  placedCards: KitCard[],
  playerId: string,
): KitGameData {
  // One definition per unique card (by card.id)
  const defByCardId = new Map<string, CardDefinition>();
  const definitions: CardDefinition[] = [];
  const instances: CardInstance[] = [];

  for (const placed of placedCards) {
    // Skip cards not assigned to deck or sideboard
    if (placed.isMainDeck === null) continue;

    if (!defByCardId.has(placed.card.id)) {
      const def: CardDefinition = {
        id: generateCardDefId(),
        sourceId: placed.card.id,
        name: placed.card.name,
        imageUrl: placed.card.imagePath,
        manaCost: placed.card.manaCost,
        type: placed.card.typeLine,
        oracleText: placed.card.oracleText,
        power: placed.card.power,
        toughness: placed.card.toughness,
      };
      defByCardId.set(placed.card.id, def);
      definitions.push(def);
    }

    const def = defByCardId.get(placed.card.id)!;
    const zone: CardInstance["zone"] = placed.isMainDeck
      ? "library"
      : "sideboard";

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

  return { definitions, instances };
}
