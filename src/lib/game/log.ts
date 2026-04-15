import type { GameAction } from "./actions";
import { generateLogId } from "./ids";
import type { ActionLogEntry, GameState, PlayerId } from "./types";

function playerName(state: GameState, playerId: PlayerId): string {
  return state.players[playerId]?.name ?? playerId;
}

export function buildLogEntry(
  state: GameState,
  action: GameAction,
): ActionLogEntry | null {
  const at = Date.now();
  const id = generateLogId();

  switch (action.type) {
    case "game/initialize":
      return {
        id,
        at,
        actionType: action.type,
        description: "Jogo inicializado.",
      };

    case "game/loadDeck": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} carregou o deck.`,
      };
    }

    case "turn/setPhase":
      return {
        id,
        at,
        actionType: action.type,
        description: `Fase alterada para ${action.phase}.`,
      };

    case "turn/advancePhase":
      return { id, at, actionType: action.type, description: "Fase avançada." };

    case "turn/passTurn":
      return { id, at, actionType: action.type, description: "Turno passado." };

    case "player/changeLife": {
      const name = playerName(state, action.playerId);
      const sign = action.delta >= 0 ? "+" : "";
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} vida ${sign}${action.delta} (total: ${(state.players[action.playerId]?.life ?? 0) + action.delta}).`,
      };
    }

    case "player/changeCounter": {
      const name = playerName(state, action.playerId);
      const sign = action.delta >= 0 ? "+" : "";
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} counter ${action.counter} ${sign}${action.delta}.`,
      };
    }

    case "player/changeMana": {
      const name = playerName(state, action.playerId);
      const sign = action.delta >= 0 ? "+" : "";
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} mana ${action.color} ${sign}${action.delta}.`,
      };
    }

    case "player/clearManaPool": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} limpou a mana pool.`,
      };
    }

    case "player/rollDie": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} rolou d${action.sides}: ${action.result}.`,
      };
    }

    case "zone/shuffle": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} embaralhou ${action.zone}.`,
      };
    }

    case "card/draw": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} comprou ${action.count} carta(s).`,
      };
    }

    case "card/mill": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} millou ${action.count} carta(s).`,
      };
    }

    case "card/surveil": {
      const name = playerName(state, action.playerId);
      const total =
        action.keepOnTopIds.length + action.putInGraveyardIds.length;
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} fez surveil ${total}.`,
      };
    }

    case "card/move": {
      const inst = state.cardInstances[action.cardId];
      const defName = inst
        ? (state.cardDefinitions[inst.definitionId]?.name ?? "carta")
        : "carta";
      return {
        id,
        at,
        actionType: action.type,
        description: `${defName}: ${action.from} → ${action.to}.`,
      };
    }

    case "card/tutor": {
      const inst = state.cardInstances[action.cardId];
      const defName = inst
        ? (state.cardDefinitions[inst.definitionId]?.name ?? "carta")
        : "carta";
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} tutoreou ${defName} (${action.from} → ${action.to}).`,
      };
    }

    case "card/setTapped": {
      const inst = state.cardInstances[action.cardId];
      const defName = inst
        ? (state.cardDefinitions[inst.definitionId]?.name ?? "carta")
        : "carta";
      return {
        id,
        at,
        actionType: action.type,
        description: `${defName} ${action.tapped ? "virado" : "desvirado"}.`,
      };
    }

    case "card/addCounter":
    case "card/removeCounter":
    case "card/setCounter": {
      const inst = state.cardInstances[action.cardId];
      const defName = inst
        ? (state.cardDefinitions[inst.definitionId]?.name ?? "carta")
        : "carta";
      const op =
        action.type === "card/addCounter"
          ? "adicionou"
          : action.type === "card/removeCounter"
            ? "removeu"
            : "definiu";
      const val =
        "value" in action
          ? action.value
          : "amount" in action
            ? action.amount
            : 0;
      return {
        id,
        at,
        actionType: action.type,
        description: `${defName} ${op} counter ${action.counter} (${val}).`,
      };
    }

    case "token/create": {
      const name = playerName(state, action.playerId);
      return {
        id,
        at,
        actionType: action.type,
        description: `${name} criou token ${action.definition.name}.`,
      };
    }

    case "token/delete": {
      const inst = state.cardInstances[action.cardId];
      const defName = inst
        ? (state.cardDefinitions[inst.definitionId]?.name ?? "token")
        : "token";
      return {
        id,
        at,
        actionType: action.type,
        description: `Token ${defName} removido.`,
      };
    }

    case "battlefield-arrow/create":
    case "battlefield-arrow/remove":
      return null;

    default:
      return null;
  }
}
