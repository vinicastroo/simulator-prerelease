"use client";

import type { GameRoomStatus } from "@prisma/client";
import { GameLobby } from "@/features/game/components/GameLobby";
import type { GameState } from "@/lib/game/types";
import { MultiplayerPlaytestClient } from "./MultiplayerPlaytestClient";

type Kit = { id: string; college: string } | null;
type UserInfo = { id: string; name: string } | null;
type OwnKit = { id: string; college: string };

type Props = {
  roomId: string;
  status: GameRoomStatus;
  myRole: "host" | "guest";
  myUserId: string;
  myPlayerId: string | null;
  myKitId: string | null;
  hostUser: UserInfo;
  guestUser: UserInfo;
  hostReady: boolean;
  guestReady: boolean;
  hostKit: Kit;
  guestKit: Kit;
  kits: OwnKit[];
  gameState: unknown;
  stateVersion: number;
};

export function GameRoomPage({
  roomId,
  status,
  myRole,
  myUserId,
  myPlayerId,
  myKitId,
  hostUser,
  guestUser,
  hostReady,
  guestReady,
  hostKit,
  guestKit,
  kits,
  gameState,
  stateVersion,
}: Props) {
  if (status === "ACTIVE" && gameState && myPlayerId) {
    return (
      <MultiplayerPlaytestClient
        roomId={roomId}
        initialGameState={gameState as GameState}
        initialStateVersion={stateVersion}
        myPlayerId={myPlayerId}
        myUserId={myUserId}
        myRole={myRole}
      />
    );
  }

  return (
    <GameLobby
      roomId={roomId}
      myRole={myRole}
      myKitId={myKitId}
      hostUser={hostUser}
      guestUser={guestUser}
      hostReady={hostReady}
      guestReady={guestReady}
      hostKit={hostKit}
      guestKit={guestKit}
      kits={kits}
    />
  );
}
