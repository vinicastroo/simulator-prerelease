import { describe, expect, it } from "vitest";
import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from "../history";
import { generatePlayerId } from "../ids";
import { createInitialGameState } from "../initial-state";

function makeState(life: number) {
  const p = { id: generatePlayerId(), name: "Player" };
  const state = createInitialGameState([p]);
  return {
    ...state,
    players: { ...state.players, [p.id]: { ...state.players[p.id], life } },
  };
}

describe("history", () => {
  it("cannot undo empty history", () => {
    const h = createHistory(makeState(20));
    expect(canUndo(h)).toBe(false);
  });

  it("can undo after push", () => {
    let h = createHistory(makeState(20));
    h = pushHistory(h, makeState(17));
    expect(canUndo(h)).toBe(true);
  });

  it("undo restores previous state", () => {
    const s1 = makeState(20);
    const s2 = makeState(17);
    let h = createHistory(s1);
    h = pushHistory(h, s2);
    h = undoHistory(h);
    expect(h.present).toEqual(s1);
  });

  it("redo after undo restores state", () => {
    const s1 = makeState(20);
    const s2 = makeState(17);
    let h = createHistory(s1);
    h = pushHistory(h, s2);
    h = undoHistory(h);
    expect(canRedo(h)).toBe(true);
    h = redoHistory(h);
    expect(h.present).toEqual(s2);
  });

  it("push clears future", () => {
    let h = createHistory(makeState(20));
    h = pushHistory(h, makeState(17));
    h = undoHistory(h);
    expect(canRedo(h)).toBe(true);
    h = pushHistory(h, makeState(15));
    expect(canRedo(h)).toBe(false);
  });

  it("respects max history bound (50)", () => {
    let h = createHistory(makeState(20));
    for (let i = 0; i < 60; i++) {
      h = pushHistory(h, makeState(20 - i));
    }
    expect(h.past.length).toBeLessThanOrEqual(50);
  });
});
