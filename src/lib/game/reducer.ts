import type { GameAction } from "./actions";
import { buildLogEntry } from "./log";
import type { CardInstance, GameState, ZoneName } from "./types";

const PHASE_ORDER: GameState["phase"][] = [
  "untap",
  "upkeep",
  "draw",
  "main1",
  "beginCombat",
  "declareAttackers",
  "declareBlockers",
  "combatDamage",
  "endCombat",
  "main2",
  "end",
  "cleanup",
];

function removeFromZone(
  state: GameState,
  cardId: string,
  zone: ZoneName,
  playerId: string,
): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        zones: {
          ...state.players[playerId].zones,
          [zone]: state.players[playerId].zones[zone].filter(
            (id) => id !== cardId,
          ),
        },
      },
    },
  };
}

function addToZone(
  state: GameState,
  cardId: string,
  zone: ZoneName,
  playerId: string,
  index?: number,
): GameState {
  const current = state.players[playerId].zones[zone];
  const newZone =
    index !== undefined
      ? [...current.slice(0, index), cardId, ...current.slice(index)]
      : [...current, cardId];

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        zones: {
          ...state.players[playerId].zones,
          [zone]: newZone,
        },
      },
    },
  };
}

function clearAttachments(state: GameState, cardId: string): GameState {
  const inst = state.cardInstances[cardId];
  if (!inst) return state;

  let next = state;

  // If this card is attached to something, remove it from that card's attachments list
  if (inst.battlefield?.attachedTo) {
    const hostId = inst.battlefield.attachedTo;
    const host = next.cardInstances[hostId];
    if (host?.battlefield) {
      next = {
        ...next,
        cardInstances: {
          ...next.cardInstances,
          [hostId]: {
            ...host,
            battlefield: {
              ...host.battlefield,
              attachments: host.battlefield.attachments.filter(
                (id) => id !== cardId,
              ),
            },
          },
        },
      };
    }
  }

  // If this card has attachments, detach all of them
  if (inst.battlefield && inst.battlefield.attachments.length > 0) {
    for (const attachId of inst.battlefield.attachments) {
      const attached = next.cardInstances[attachId];
      if (attached?.battlefield) {
        next = {
          ...next,
          cardInstances: {
            ...next.cardInstances,
            [attachId]: {
              ...attached,
              battlefield: {
                ...attached.battlefield,
                attachedTo: null,
              },
            },
          },
        };
      }
    }
  }

  return next;
}

function moveCard(
  state: GameState,
  cardId: string,
  from: ZoneName,
  fromPlayerId: string,
  to: ZoneName,
  toPlayerId: string,
  index?: number,
): GameState {
  const inst = state.cardInstances[cardId];
  if (!inst) return state;

  let next = state;

  // Clear attachments when leaving battlefield
  if (from === "battlefield") {
    next = clearAttachments(next, cardId);
  }

  next = removeFromZone(next, cardId, from, fromPlayerId);
  next = addToZone(next, cardId, to, toPlayerId, index);

  const battlefieldData: CardInstance["battlefield"] =
    to === "battlefield"
      ? { x: 0, y: 0, z: 0, attachedTo: null, attachments: [] }
      : null;

  next = {
    ...next,
    cardInstances: {
      ...next.cardInstances,
      [cardId]: {
        ...next.cardInstances[cardId],
        zone: to,
        controllerId: toPlayerId,
        tapped: false,
        faceDown: false,
        battlefield: battlefieldData,
      },
    },
  };

  return next;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const logEntry = buildLogEntry(state, action);

  let next = applyAction(state, action);

  if (logEntry) {
    next = { ...next, log: [...next.log, logEntry] };
  }

  return next;
}

function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "game/initialize":
      return action.state;

    case "game/loadDeck": {
      const newDefs = Object.fromEntries(
        action.definitions.map((d) => [d.id, d]),
      );
      const newInsts = Object.fromEntries(
        action.instances.map((i) => [i.id, i]),
      );

      const player = state.players[action.playerId];
      if (!player) return state;

      const commandIds = action.instances
        .filter((i) => i.zone === "command")
        .map((i) => i.id);

      const libraryIds = action.instances
        .filter((i) => i.zone === "library")
        .map((i) => i.id);

      const sideboardIds = action.instances
        .filter((i) => i.zone === "sideboard")
        .map((i) => i.id);

      return {
        ...state,
        cardDefinitions: newDefs,
        cardInstances: newInsts,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            life: 20,
            lifeHistory: [],
            counters: {
              poison: 0,
              energy: 0,
              experience: 0,
              storm: 0,
              custom: {},
            },
            manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
            zones: {
              library: libraryIds,
              hand: [],
              battlefield: [],
              graveyard: [],
              exile: [],
              sideboard: sideboardIds,
              command: commandIds,
            },
          },
        },
      };
    }

    case "turn/setPhase":
      return { ...state, phase: action.phase };

    case "turn/advancePhase": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      if (idx === -1 || idx === PHASE_ORDER.length - 1) {
        // Wrap to next player
        const nextPlayerIdx =
          (state.playerOrder.indexOf(state.activePlayerId) + 1) %
          state.playerOrder.length;
        const nextPlayerId = state.playerOrder[nextPlayerIdx];
        return {
          ...state,
          phase: PHASE_ORDER[0],
          activePlayerId: nextPlayerId,
          priorityPlayerId: nextPlayerId,
          turnNumber:
            nextPlayerIdx === 0 ? state.turnNumber + 1 : state.turnNumber,
        };
      }
      return { ...state, phase: PHASE_ORDER[idx + 1] };
    }

    case "turn/passTurn": {
      const nextPlayerIdx =
        (state.playerOrder.indexOf(state.activePlayerId) + 1) %
        state.playerOrder.length;
      const nextPlayerId = state.playerOrder[nextPlayerIdx];
      return {
        ...state,
        phase: "untap",
        activePlayerId: nextPlayerId,
        priorityPlayerId: nextPlayerId,
        turnNumber:
          nextPlayerIdx === 0 ? state.turnNumber + 1 : state.turnNumber,
      };
    }

    case "player/changeLife": {
      const player = state.players[action.playerId];
      if (!player) return state;
      const newLife = player.life + action.delta;
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            life: newLife,
            lifeHistory: [
              ...player.lifeHistory,
              { delta: action.delta, value: newLife, at: action.at },
            ],
          },
        },
      };
    }

    case "player/changeCounter": {
      const player = state.players[action.playerId];
      if (!player) return state;
      const counters = player.counters;

      if (
        action.counter === "poison" ||
        action.counter === "energy" ||
        action.counter === "experience" ||
        action.counter === "storm"
      ) {
        return {
          ...state,
          players: {
            ...state.players,
            [action.playerId]: {
              ...player,
              counters: {
                ...counters,
                [action.counter]: Math.max(
                  0,
                  counters[action.counter] + action.delta,
                ),
              },
            },
          },
        };
      }

      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            counters: {
              ...counters,
              custom: {
                ...counters.custom,
                [action.counter]: Math.max(
                  0,
                  (counters.custom[action.counter] ?? 0) + action.delta,
                ),
              },
            },
          },
        },
      };
    }

    case "player/changeMana": {
      const player = state.players[action.playerId];
      if (!player) return state;
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            manaPool: {
              ...player.manaPool,
              [action.color]: Math.max(
                0,
                player.manaPool[action.color] + action.delta,
              ),
            },
          },
        },
      };
    }

    case "player/clearManaPool": {
      const player = state.players[action.playerId];
      if (!player) return state;
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
          },
        },
      };
    }

    case "player/rollDie":
      // Result is already pre-computed (random outside reducer)
      return state;

    case "zone/shuffle":
    case "zone/reorder": {
      const player = state.players[action.playerId];
      if (!player) return state;
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            zones: {
              ...player.zones,
              [action.zone]: action.orderedIds,
            },
          },
        },
      };
    }

    case "card/move": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return moveCard(
        state,
        action.cardId,
        inst.zone,
        inst.controllerId,
        action.to,
        action.toPlayerId,
        action.index,
      );
    }

    case "card/moveMany": {
      let next = state;
      for (const cardId of action.cardIds) {
        const inst = next.cardInstances[cardId];
        if (!inst) continue;
        next = moveCard(
          next,
          cardId,
          inst.zone,
          inst.controllerId,
          action.to,
          action.toPlayerId,
          action.index,
        );
      }
      return next;
    }

    case "card/draw": {
      const player = state.players[action.playerId];
      if (!player) return state;
      const library = [...player.zones.library];
      const drawn = library.splice(0, action.count);
      const next: GameState = {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            zones: {
              ...player.zones,
              library,
              hand: [...player.zones.hand, ...drawn],
            },
          },
        },
      };
      // Update zone on instances
      const updatedInsts: GameState["cardInstances"] = {
        ...next.cardInstances,
      };
      for (const id of drawn) {
        if (updatedInsts[id]) {
          updatedInsts[id] = { ...updatedInsts[id], zone: "hand" };
        }
      }
      return { ...next, cardInstances: updatedInsts };
    }

    case "card/mill": {
      const player = state.players[action.playerId];
      if (!player) return state;
      const library = [...player.zones.library];
      const milled = library.splice(0, action.count);
      const next: GameState = {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            zones: {
              ...player.zones,
              library,
              graveyard: [...player.zones.graveyard, ...milled],
            },
          },
        },
      };
      const updatedInsts: GameState["cardInstances"] = {
        ...next.cardInstances,
      };
      for (const id of milled) {
        if (updatedInsts[id]) {
          updatedInsts[id] = { ...updatedInsts[id], zone: "graveyard" };
        }
      }
      return { ...next, cardInstances: updatedInsts };
    }

    case "card/revealTop":
      // No state change needed for reveal (visual only in solo)
      return state;

    case "card/scry": {
      const player = state.players[action.playerId];
      if (!player) return state;
      const library = player.zones.library.filter(
        (id) =>
          !action.keepOnTopIds.includes(id) &&
          !action.putOnBottomIds.includes(id),
      );
      const newLibrary = [
        ...action.keepOnTopIds,
        ...library,
        ...action.putOnBottomIds,
      ];
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            zones: { ...player.zones, library: newLibrary },
          },
        },
      };
    }

    case "card/tutor": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return moveCard(
        state,
        action.cardId,
        action.from,
        inst.controllerId,
        action.to,
        action.playerId,
      );
    }

    case "card/setTapped": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.cardId]: { ...inst, tapped: action.tapped },
        },
      };
    }

    case "card/setFaceDown": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.cardId]: { ...inst, faceDown: action.faceDown },
        },
      };
    }

    case "card/setBattlefieldPosition": {
      const inst = state.cardInstances[action.cardId];
      if (!inst?.battlefield) return state;
      return {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.cardId]: {
            ...inst,
            battlefield: {
              ...inst.battlefield,
              x: action.x,
              y: action.y,
              z: action.z,
            },
          },
        },
      };
    }

    case "card/addCounter": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.cardId]: {
            ...inst,
            counters: {
              ...inst.counters,
              [action.counter]:
                (inst.counters[action.counter] ?? 0) + action.amount,
            },
          },
        },
      };
    }

    case "card/removeCounter": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.cardId]: {
            ...inst,
            counters: {
              ...inst.counters,
              [action.counter]: Math.max(
                0,
                (inst.counters[action.counter] ?? 0) - action.amount,
              ),
            },
          },
        },
      };
    }

    case "card/setCounter": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;
      return {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.cardId]: {
            ...inst,
            counters: {
              ...inst.counters,
              [action.counter]: action.value,
            },
          },
        },
      };
    }

    case "card/attach": {
      const source = state.cardInstances[action.sourceId];
      const target = state.cardInstances[action.targetId];
      if (!source || !target?.battlefield) return state;

      // First, detach from previous host if any
      let next = state;
      if (source.battlefield?.attachedTo) {
        const prevHostId = source.battlefield.attachedTo;
        const prevHost = next.cardInstances[prevHostId];
        if (prevHost?.battlefield) {
          next = {
            ...next,
            cardInstances: {
              ...next.cardInstances,
              [prevHostId]: {
                ...prevHost,
                battlefield: {
                  ...prevHost.battlefield,
                  attachments: prevHost.battlefield.attachments.filter(
                    (id) => id !== action.sourceId,
                  ),
                },
              },
            },
          };
        }
      }

      const sourceBf = next.cardInstances[action.sourceId].battlefield ?? {
        x: 0,
        y: 0,
        z: 0,
        attachedTo: null,
        attachments: [],
      };

      return {
        ...next,
        cardInstances: {
          ...next.cardInstances,
          [action.sourceId]: {
            ...next.cardInstances[action.sourceId],
            battlefield: { ...sourceBf, attachedTo: action.targetId },
          },
          [action.targetId]: {
            ...target,
            battlefield: {
              ...target.battlefield,
              attachments: [...target.battlefield.attachments, action.sourceId],
            },
          },
        },
      };
    }

    case "card/detach": {
      const source = state.cardInstances[action.sourceId];
      if (!source?.battlefield?.attachedTo) return state;

      const hostId = source.battlefield.attachedTo;
      const host = state.cardInstances[hostId];

      let next: GameState = {
        ...state,
        cardInstances: {
          ...state.cardInstances,
          [action.sourceId]: {
            ...source,
            battlefield: { ...source.battlefield, attachedTo: null },
          },
        },
      };

      if (host?.battlefield) {
        next = {
          ...next,
          cardInstances: {
            ...next.cardInstances,
            [hostId]: {
              ...host,
              battlefield: {
                ...host.battlefield,
                attachments: host.battlefield.attachments.filter(
                  (id) => id !== action.sourceId,
                ),
              },
            },
          },
        };
      }

      return next;
    }

    case "token/create": {
      const player = state.players[action.playerId];
      if (!player) return state;

      return {
        ...state,
        cardDefinitions: {
          ...state.cardDefinitions,
          [action.definition.id]: action.definition,
        },
        cardInstances: {
          ...state.cardInstances,
          [action.instance.id]: action.instance,
        },
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            zones: {
              ...player.zones,
              battlefield: [...player.zones.battlefield, action.instance.id],
            },
          },
        },
      };
    }

    case "token/duplicateFromCard": {
      const source = state.cardInstances[action.sourceCardId];
      if (!source) return state;
      const player = state.players[action.newInstance.ownerId];
      if (!player) return state;

      return {
        ...state,
        cardDefinitions: {
          ...state.cardDefinitions,
          [action.newDefinition.id]: action.newDefinition,
        },
        cardInstances: {
          ...state.cardInstances,
          [action.newInstance.id]: action.newInstance,
        },
        players: {
          ...state.players,
          [action.newInstance.ownerId]: {
            ...player,
            zones: {
              ...player.zones,
              battlefield: [...player.zones.battlefield, action.newInstance.id],
            },
          },
        },
      };
    }

    case "token/delete": {
      const inst = state.cardInstances[action.cardId];
      if (!inst) return state;

      let next = state;

      // Clear attachments
      if (inst.zone === "battlefield") {
        next = clearAttachments(next, action.cardId);
      }

      // Remove from player zone
      const player = next.players[inst.ownerId];
      if (player) {
        next = {
          ...next,
          players: {
            ...next.players,
            [inst.ownerId]: {
              ...player,
              zones: {
                ...player.zones,
                [inst.zone]: player.zones[inst.zone].filter(
                  (id) => id !== action.cardId,
                ),
              },
            },
          },
        };
      }

      // Remove instance (keep definition for reference)
      const { [action.cardId]: _removed, ...remainingInsts } =
        next.cardInstances;
      return { ...next, cardInstances: remainingInsts };
    }

    case "card/setPowerToughness": {
      const def = state.cardDefinitions[action.defId];
      if (!def) return state;
      return {
        ...state,
        cardDefinitions: {
          ...state.cardDefinitions,
          [action.defId]: {
            ...def,
            power: action.power,
            toughness: action.toughness,
          },
        },
      };
    }

    case "card/ping":
      // UI-only signal — no state change; broadcast via Pusher for opponent to react
      return state;

    default:
      return state;
  }
}
