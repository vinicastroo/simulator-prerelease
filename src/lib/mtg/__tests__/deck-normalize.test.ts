import { describe, it, expect } from "vitest";
import { normalizeDeck } from "../deck-normalize";
import { generateCardDefId } from "@/lib/game/ids";
import type { CardDefinition } from "@/lib/game/types";
import type { DeckJson } from "../deck-schema";

function makeDef(name: string): CardDefinition {
  return {
    id: generateCardDefId(),
    sourceId: name,
    name,
    imageUrl: null,
    manaCost: null,
    type: "Creature",
    oracleText: null,
    power: "1",
    toughness: "1",
  };
}

describe("normalizeDeck", () => {
  const playerId = "player_test";

  it("creates the correct number of instances for each card count", () => {
    const deckJson: DeckJson = {
      cards: [
        { count: 4, name: "Lightning Bolt", sideboard: false },
        { count: 2, name: "Forest", sideboard: false },
      ],
    };

    const boltDef = makeDef("Lightning Bolt");
    const forestDef = makeDef("Forest");
    const definitions = new Map([
      ["Lightning Bolt", boltDef],
      ["Forest", forestDef],
    ]);

    const { instances, definitions: defs } = normalizeDeck(
      deckJson,
      definitions,
      playerId,
    );

    expect(instances.filter((i) => i.definitionId === boltDef.id)).toHaveLength(
      4,
    );
    expect(
      instances.filter((i) => i.definitionId === forestDef.id),
    ).toHaveLength(2);
    expect(defs).toHaveLength(2);
  });

  it("gives each copy a unique ID", () => {
    const deckJson: DeckJson = {
      cards: [{ count: 4, name: "Llanowar Elves", sideboard: false }],
    };
    const def = makeDef("Llanowar Elves");
    const definitions = new Map([["Llanowar Elves", def]]);

    const { instances } = normalizeDeck(deckJson, definitions, playerId);
    const ids = instances.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(4);
  });

  it("places sideboard cards in sideboard zone", () => {
    const deckJson: DeckJson = {
      cards: [
        { count: 2, name: "Rest in Peace", sideboard: true },
        { count: 4, name: "Forest", sideboard: false },
      ],
    };
    const ripDef = makeDef("Rest in Peace");
    const forestDef = makeDef("Forest");
    const definitions = new Map([
      ["Rest in Peace", ripDef],
      ["Forest", forestDef],
    ]);

    const { instances } = normalizeDeck(deckJson, definitions, playerId);
    const sideboard = instances.filter((i) => i.zone === "sideboard");
    const library = instances.filter((i) => i.zone === "library");

    expect(sideboard).toHaveLength(2);
    expect(library).toHaveLength(4);
  });

  it("deduplicates definitions for repeated card names", () => {
    const deckJson: DeckJson = {
      cards: [
        { count: 2, name: "Lightning Bolt", sideboard: false },
        { count: 2, name: "Lightning Bolt", sideboard: true },
      ],
    };
    const def = makeDef("Lightning Bolt");
    const definitions = new Map([["Lightning Bolt", def]]);

    const { definitions: defs, instances } = normalizeDeck(
      deckJson,
      definitions,
      playerId,
    );
    expect(defs).toHaveLength(1);
    expect(instances).toHaveLength(4);
  });

  it("ignores cards missing from definitions map", () => {
    const deckJson: DeckJson = {
      cards: [
        { count: 2, name: "Unknown Card", sideboard: false },
        { count: 1, name: "Forest", sideboard: false },
      ],
    };
    const forestDef = makeDef("Forest");
    const definitions = new Map([["Forest", forestDef]]);

    const { instances } = normalizeDeck(deckJson, definitions, playerId);
    expect(instances).toHaveLength(1);
  });
});
