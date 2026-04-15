import { generatePlayerId } from "@/lib/game/ids";
import { createInitialGameState } from "@/lib/game/initial-state";
import { kitToGameData } from "@/lib/mtg/kit-to-game";
import type { GameState } from "./types";

type RoomCard = {
  id: string;
  name: string;
  imagePath: string;
  manaCost: string | null;
  typeLine: string;
  oracleText: string | null;
  power: string | null;
  toughness: string | null;
};

type RoomKit = {
  placedCards: Array<{
    id: string;
    isMainDeck: boolean | null;
    card: RoomCard;
  }>;
} | null;

type RoomGameStateInput = {
  hostPlayerId: string | null;
  guestPlayerId: string | null;
  hostUserName: string;
  guestUserName: string | null;
  hostKit: RoomKit;
  guestKit: RoomKit;
};

export function buildRoomGameState(input: RoomGameStateInput): {
  gameState: GameState;
  hostPlayerId: string;
  guestPlayerId: string;
} {
  const hostPlayerId = input.hostPlayerId ?? generatePlayerId();
  const guestPlayerId = input.guestPlayerId ?? generatePlayerId();

  let gameState = createInitialGameState([
    { id: hostPlayerId, name: input.hostUserName },
    { id: guestPlayerId, name: input.guestUserName ?? "Oponente" },
  ]);

  if (input.hostKit) {
    const { definitions, instances } = kitToGameData(
      input.hostKit.placedCards.map((pc) => ({
        id: pc.id,
        isMainDeck: pc.isMainDeck,
        card: pc.card,
      })),
      hostPlayerId,
    );
    const hostPlayer = gameState.players[hostPlayerId];
    if (!hostPlayer) throw new Error("HOST_PLAYER_NOT_FOUND");

    gameState = {
      ...gameState,
      cardDefinitions: {
        ...gameState.cardDefinitions,
        ...Object.fromEntries(
          definitions.map((definition) => [definition.id, definition]),
        ),
      },
      cardInstances: {
        ...gameState.cardInstances,
        ...Object.fromEntries(
          instances.map((instance) => [instance.id, instance]),
        ),
      },
      players: {
        ...gameState.players,
        [hostPlayerId]: {
          ...hostPlayer,
          zones: {
            ...hostPlayer.zones,
            library: instances
              .filter((instance) => instance.zone === "library")
              .map((instance) => instance.id),
            sideboard: instances
              .filter((instance) => instance.zone === "sideboard")
              .map((instance) => instance.id),
          },
        },
      },
    };
  }

  if (input.guestKit) {
    const { definitions, instances } = kitToGameData(
      input.guestKit.placedCards.map((pc) => ({
        id: pc.id,
        isMainDeck: pc.isMainDeck,
        card: pc.card,
      })),
      guestPlayerId,
    );
    const guestPlayer = gameState.players[guestPlayerId];
    if (!guestPlayer) throw new Error("GUEST_PLAYER_NOT_FOUND");

    gameState = {
      ...gameState,
      cardDefinitions: {
        ...gameState.cardDefinitions,
        ...Object.fromEntries(
          definitions.map((definition) => [definition.id, definition]),
        ),
      },
      cardInstances: {
        ...gameState.cardInstances,
        ...Object.fromEntries(
          instances.map((instance) => [instance.id, instance]),
        ),
      },
      players: {
        ...gameState.players,
        [guestPlayerId]: {
          ...guestPlayer,
          zones: {
            ...guestPlayer.zones,
            library: instances
              .filter((instance) => instance.zone === "library")
              .map((instance) => instance.id),
            sideboard: instances
              .filter((instance) => instance.zone === "sideboard")
              .map((instance) => instance.id),
          },
        },
      },
    };
  }

  return { gameState, hostPlayerId, guestPlayerId };
}
