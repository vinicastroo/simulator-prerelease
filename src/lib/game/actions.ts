import type {
  CardDefId,
  CardDefinition,
  CardInstance,
  CardInstanceId,
  GameState,
  PlayerId,
  TurnPhase,
  ZoneName,
} from "./types";

export type GameAction =
  | { type: "game/initialize"; state: GameState }
  | {
      type: "game/loadDeck";
      playerId: PlayerId;
      definitions: CardDefinition[];
      instances: CardInstance[];
    }
  | { type: "turn/setPhase"; phase: TurnPhase }
  | { type: "turn/advancePhase" }
  | { type: "turn/passTurn" }
  | { type: "player/changeLife"; playerId: PlayerId; delta: number; at: number }
  | {
      type: "player/changeCounter";
      playerId: PlayerId;
      counter: string;
      delta: number;
    }
  | {
      type: "player/changeMana";
      playerId: PlayerId;
      color: "W" | "U" | "B" | "R" | "G" | "C";
      delta: number;
    }
  | { type: "player/clearManaPool"; playerId: PlayerId }
  | {
      type: "player/rollDie";
      playerId: PlayerId;
      sides: 2 | 4 | 6 | 20;
      result: number;
    }
  | {
      type: "zone/shuffle";
      playerId: PlayerId;
      zone: "library" | "sideboard";
      orderedIds: CardInstanceId[];
    }
  | {
      type: "zone/reorder";
      playerId: PlayerId;
      zone: ZoneName;
      orderedIds: CardInstanceId[];
    }
  | {
      type: "card/move";
      cardId: CardInstanceId;
      from: ZoneName;
      to: ZoneName;
      toPlayerId: PlayerId;
      index?: number;
    }
  | {
      type: "card/moveMany";
      cardIds: CardInstanceId[];
      to: ZoneName;
      toPlayerId: PlayerId;
      index?: number;
    }
  | { type: "card/draw"; playerId: PlayerId; count: number }
  | { type: "card/mill"; playerId: PlayerId; count: number }
  | { type: "card/revealTop"; playerId: PlayerId; count: number }
  | {
      type: "card/scry";
      playerId: PlayerId;
      keepOnTopIds: CardInstanceId[];
      putOnBottomIds: CardInstanceId[];
    }
  | {
      type: "card/tutor";
      playerId: PlayerId;
      cardId: CardInstanceId;
      from: ZoneName;
      to: ZoneName;
    }
  | { type: "card/setTapped"; cardId: CardInstanceId; tapped: boolean }
  | { type: "card/setFaceDown"; cardId: CardInstanceId; faceDown: boolean }
  | {
      type: "card/setBattlefieldPosition";
      cardId: CardInstanceId;
      x: number;
      y: number;
      z: number;
    }
  | {
      type: "card/addCounter";
      cardId: CardInstanceId;
      counter: string;
      amount: number;
    }
  | {
      type: "card/removeCounter";
      cardId: CardInstanceId;
      counter: string;
      amount: number;
    }
  | {
      type: "card/setCounter";
      cardId: CardInstanceId;
      counter: string;
      value: number;
    }
  | { type: "card/attach"; sourceId: CardInstanceId; targetId: CardInstanceId }
  | { type: "card/detach"; sourceId: CardInstanceId }
  | {
      type: "token/create";
      playerId: PlayerId;
      definition: CardDefinition;
      instance: CardInstance;
    }
  | {
      type: "token/duplicateFromCard";
      sourceCardId: CardInstanceId;
      newDefinition: CardDefinition;
      newInstance: CardInstance;
    }
  | { type: "token/delete"; cardId: CardInstanceId }
  | {
      type: "card/setPowerToughness";
      cardId: CardInstanceId;
      defId: CardDefId;
      power: string | null;
      toughness: string | null;
    }
  | { type: "card/ping"; cardId: CardInstanceId };
