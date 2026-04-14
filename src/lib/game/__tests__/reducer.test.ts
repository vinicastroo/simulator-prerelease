import { describe, expect, it } from "vitest";
import {
  generateCardDefId,
  generateCardInstanceId,
  generatePlayerId,
} from "../ids";
import { createInitialGameState } from "../initial-state";
import { gameReducer } from "../reducer";
import type { CardDefinition, CardInstance, GameState } from "../types";

function makePlayer(name = "Alice") {
  return { id: generatePlayerId(), name };
}

function makeDef(overrides?: Partial<CardDefinition>): CardDefinition {
  return {
    id: generateCardDefId(),
    sourceId: "scryfall-123",
    name: "Test Card",
    imageUrl: null,
    manaCost: "{1}{G}",
    type: "Creature — Elf",
    oracleText: null,
    power: "1",
    toughness: "1",
    ...overrides,
  };
}

function makeInstance(
  defId: string,
  playerId: string,
  zone: CardInstance["zone"] = "library",
  overrides?: Partial<CardInstance>,
): CardInstance {
  return {
    id: generateCardInstanceId(),
    definitionId: defId,
    ownerId: playerId,
    controllerId: playerId,
    zone,
    tapped: false,
    faceDown: false,
    counters: {},
    isToken: false,
    customName: null,
    tokenData: null,
    battlefield:
      zone === "battlefield"
        ? { x: 0, y: 0, z: 0, attachedTo: null, attachments: [] }
        : null,
    ...overrides,
  };
}

function loadDeck(state: GameState, playerId: string, count = 3): GameState {
  const defs = Array.from({ length: count }, () => makeDef());
  const insts = defs.map((d) => makeInstance(d.id, playerId, "library"));
  return gameReducer(state, {
    type: "game/loadDeck",
    playerId,
    definitions: defs,
    instances: insts,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("gameReducer", () => {
  describe("game/initialize", () => {
    it("replaces state entirely", () => {
      const p = makePlayer();
      const initial = createInitialGameState([p]);
      const fresh = createInitialGameState([makePlayer("Bob")]);
      const next = gameReducer(initial, {
        type: "game/initialize",
        state: fresh,
      });
      expect(next.playerOrder).toEqual(fresh.playerOrder);
    });
  });

  describe("game/loadDeck", () => {
    it("puts instances into library", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      const def = makeDef();
      const inst = makeInstance(def.id, p.id, "library");
      state = gameReducer(state, {
        type: "game/loadDeck",
        playerId: p.id,
        definitions: [def],
        instances: [inst],
      });
      expect(state.players[p.id].zones.library).toContain(inst.id);
      expect(state.cardDefinitions[def.id]).toBeDefined();
      expect(state.cardInstances[inst.id]).toBeDefined();
    });

    it("puts sideboard instances into sideboard zone", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      const def = makeDef();
      const inst = makeInstance(def.id, p.id, "sideboard");
      state = gameReducer(state, {
        type: "game/loadDeck",
        playerId: p.id,
        definitions: [def],
        instances: [inst],
      });
      expect(state.players[p.id].zones.sideboard).toContain(inst.id);
    });
  });

  describe("card/move", () => {
    it("moves card between zones", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 1);
      const cardId = state.players[p.id].zones.library[0];

      state = gameReducer(state, {
        type: "card/move",
        cardId,
        from: "library",
        to: "hand",
        toPlayerId: p.id,
      });

      expect(state.players[p.id].zones.library).not.toContain(cardId);
      expect(state.players[p.id].zones.hand).toContain(cardId);
      expect(state.cardInstances[cardId].zone).toBe("hand");
    });

    it("adds battlefield data when moving to battlefield", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 1);
      const cardId = state.players[p.id].zones.library[0];

      state = gameReducer(state, {
        type: "card/move",
        cardId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });

      expect(state.cardInstances[cardId].battlefield).not.toBeNull();
    });

    it("clears battlefield data when leaving battlefield", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 1);
      const cardId = state.players[p.id].zones.library[0];

      state = gameReducer(state, {
        type: "card/move",
        cardId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });
      state = gameReducer(state, {
        type: "card/move",
        cardId,
        from: "battlefield",
        to: "graveyard",
        toPlayerId: p.id,
      });

      expect(state.cardInstances[cardId].battlefield).toBeNull();
    });
  });

  describe("card/draw", () => {
    it("moves cards from library to hand", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 5);

      const libraryBefore = state.players[p.id].zones.library.length;
      state = gameReducer(state, {
        type: "card/draw",
        playerId: p.id,
        count: 3,
      });

      expect(state.players[p.id].zones.library).toHaveLength(libraryBefore - 3);
      expect(state.players[p.id].zones.hand).toHaveLength(3);
    });
  });

  describe("card/mill", () => {
    it("moves cards from library to graveyard", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 5);

      state = gameReducer(state, {
        type: "card/mill",
        playerId: p.id,
        count: 2,
      });

      expect(state.players[p.id].zones.graveyard).toHaveLength(2);
    });
  });

  describe("card/setTapped", () => {
    it("taps and untaps a card", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 1);
      const cardId = state.players[p.id].zones.library[0];
      state = gameReducer(state, {
        type: "card/move",
        cardId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });

      state = gameReducer(state, {
        type: "card/setTapped",
        cardId,
        tapped: true,
      });
      expect(state.cardInstances[cardId].tapped).toBe(true);

      state = gameReducer(state, {
        type: "card/setTapped",
        cardId,
        tapped: false,
      });
      expect(state.cardInstances[cardId].tapped).toBe(false);
    });
  });

  describe("card/setFaceDown", () => {
    it("toggles face down", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 1);
      const cardId = state.players[p.id].zones.library[0];
      state = gameReducer(state, {
        type: "card/move",
        cardId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });

      state = gameReducer(state, {
        type: "card/setFaceDown",
        cardId,
        faceDown: true,
      });
      expect(state.cardInstances[cardId].faceDown).toBe(true);

      state = gameReducer(state, {
        type: "card/setFaceDown",
        cardId,
        faceDown: false,
      });
      expect(state.cardInstances[cardId].faceDown).toBe(false);
    });
  });

  describe("player/changeLife", () => {
    it("records life history", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = gameReducer(state, {
        type: "player/changeLife",
        playerId: p.id,
        delta: -3,
        at: 1000,
      });
      expect(state.players[p.id].life).toBe(17);
      expect(state.players[p.id].lifeHistory).toHaveLength(1);
      expect(state.players[p.id].lifeHistory[0].delta).toBe(-3);
    });
  });

  describe("zone/shuffle", () => {
    it("applies the given order", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 3);

      const original = [...state.players[p.id].zones.library];
      const reversed = [...original].reverse();

      state = gameReducer(state, {
        type: "zone/shuffle",
        playerId: p.id,
        zone: "library",
        orderedIds: reversed,
      });

      expect(state.players[p.id].zones.library).toEqual(reversed);
    });
  });

  describe("card/attach and card/detach", () => {
    it("attaches and detaches a card", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 2);

      const [equipId, creatureId] = state.players[p.id].zones.library;
      state = gameReducer(state, {
        type: "card/move",
        cardId: equipId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });
      state = gameReducer(state, {
        type: "card/move",
        cardId: creatureId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });

      state = gameReducer(state, {
        type: "card/attach",
        sourceId: equipId,
        targetId: creatureId,
      });
      expect(state.cardInstances[equipId].battlefield?.attachedTo).toBe(
        creatureId,
      );
      expect(
        state.cardInstances[creatureId].battlefield?.attachments,
      ).toContain(equipId);

      state = gameReducer(state, { type: "card/detach", sourceId: equipId });
      expect(state.cardInstances[equipId].battlefield?.attachedTo).toBeNull();
      expect(
        state.cardInstances[creatureId].battlefield?.attachments,
      ).not.toContain(equipId);
    });

    it("clears attachment when moving off battlefield", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 2);
      const [equipId, creatureId] = state.players[p.id].zones.library;
      state = gameReducer(state, {
        type: "card/move",
        cardId: equipId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });
      state = gameReducer(state, {
        type: "card/move",
        cardId: creatureId,
        from: "library",
        to: "battlefield",
        toPlayerId: p.id,
      });
      state = gameReducer(state, {
        type: "card/attach",
        sourceId: equipId,
        targetId: creatureId,
      });

      // Move equip to graveyard — should clear attachment
      state = gameReducer(state, {
        type: "card/move",
        cardId: equipId,
        from: "battlefield",
        to: "graveyard",
        toPlayerId: p.id,
      });
      expect(
        state.cardInstances[creatureId].battlefield?.attachments,
      ).not.toContain(equipId);
    });
  });

  describe("card/scry", () => {
    it("reorders library keeping specified on top and bottom", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      state = loadDeck(state, p.id, 4);
      const [a, b, c, d] = state.players[p.id].zones.library;

      state = gameReducer(state, {
        type: "card/scry",
        playerId: p.id,
        keepOnTopIds: [b],
        putOnBottomIds: [a],
      });

      const lib = state.players[p.id].zones.library;
      expect(lib[0]).toBe(b);
      expect(lib[lib.length - 1]).toBe(a);
      expect(lib).toContain(c);
      expect(lib).toContain(d);
    });
  });

  describe("token/create and token/delete", () => {
    it("creates a token on the battlefield", () => {
      const p = makePlayer();
      let state = createInitialGameState([p]);
      const def = makeDef({
        name: "Goblin Token",
        type: "Token Creature — Goblin",
      });
      const inst = makeInstance(def.id, p.id, "battlefield", {
        isToken: true,
        battlefield: { x: 0, y: 0, z: 0, attachedTo: null, attachments: [] },
      });

      state = gameReducer(state, {
        type: "token/create",
        playerId: p.id,
        definition: def,
        instance: inst,
      });
      expect(state.players[p.id].zones.battlefield).toContain(inst.id);

      state = gameReducer(state, { type: "token/delete", cardId: inst.id });
      expect(state.players[p.id].zones.battlefield).not.toContain(inst.id);
      expect(state.cardInstances[inst.id]).toBeUndefined();
    });
  });
});
