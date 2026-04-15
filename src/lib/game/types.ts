export type PlayerId = string;
export type CardDefId = string;
export type CardInstanceId = string;

export type ZoneName =
  | "library"
  | "hand"
  | "battlefield"
  | "graveyard"
  | "exile"
  | "sideboard"
  | "command";

export type TurnPhase =
  | "untap"
  | "upkeep"
  | "draw"
  | "main1"
  | "beginCombat"
  | "declareAttackers"
  | "declareBlockers"
  | "combatDamage"
  | "endCombat"
  | "main2"
  | "end"
  | "cleanup";

export type CardDefinition = {
  id: CardDefId;
  sourceId: string;
  name: string;
  imageUrl: string | null;
  manaCost: string | null;
  type: string;
  oracleText: string | null;
  power: string | null;
  toughness: string | null;
};

export type CardInstance = {
  id: CardInstanceId;
  definitionId: CardDefId;
  ownerId: PlayerId;
  controllerId: PlayerId;
  zone: ZoneName;
  tapped: boolean;
  faceDown: boolean;
  counters: Record<string, number>;
  isToken: boolean;
  customName: string | null;
  tokenData: {
    name: string;
    power: string | null;
    toughness: string | null;
    color: string | null;
    type: string | null;
    imageUrl: string | null;
  } | null;
  battlefield: {
    x: number;
    y: number;
    z: number;
    attachedTo: CardInstanceId | null;
    attachments: CardInstanceId[];
  } | null;
};

export type BattlefieldArrow = {
  id: string;
  playerId: PlayerId;
  createdByPlayerId: PlayerId;
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
};

export type PlayerState = {
  id: PlayerId;
  name: string;
  life: number;
  lifeHistory: { delta: number; value: number; at: number }[];
  counters: {
    poison: number;
    energy: number;
    experience: number;
    storm: number;
    custom: Record<string, number>;
  };
  manaPool: {
    W: number;
    U: number;
    B: number;
    R: number;
    G: number;
    C: number;
  };
  zones: Record<ZoneName, CardInstanceId[]>;
};

export type ActionLogEntry = {
  id: string;
  at: number;
  description: string;
  actionType: string;
};

export type GameSetupState = {
  mulligan:
    | {
        stage: "mulligan";
        keptPlayerIds: PlayerId[];
        handSizeByPlayerId: Partial<Record<PlayerId, number>>;
        mulliganCountByPlayerId: Partial<Record<PlayerId, number>>;
      }
    | {
        stage: "ready";
        keptPlayerIds: PlayerId[];
        firstPlayerId: PlayerId;
        handSizeByPlayerId: Partial<Record<PlayerId, number>>;
        mulliganCountByPlayerId: Partial<Record<PlayerId, number>>;
      };
};

export type GameState = {
  id: string;
  createdAt: number;
  players: Record<PlayerId, PlayerState>;
  playerOrder: PlayerId[];
  activePlayerId: PlayerId;
  priorityPlayerId: PlayerId;
  turnNumber: number;
  phase: TurnPhase;
  cardDefinitions: Record<CardDefId, CardDefinition>;
  cardInstances: Record<CardInstanceId, CardInstance>;
  battlefieldArrows: BattlefieldArrow[];
  log: ActionLogEntry[];
  setup?: GameSetupState;
};
