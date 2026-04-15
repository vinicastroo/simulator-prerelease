"use client";

import { MultiplayerPlaymat } from "@/features/game/components/MultiplayerPlaymat";
import { MultiplayerGameProvider } from "@/features/game/store/MultiplayerGameProvider";
import type { GameState } from "@/lib/game/types";

type Props = {
  roomId: string;
  initialGameState: GameState;
  initialStateVersion: number;
  myPlayerId: string;
  myUserId: string;
  myRole: "host" | "guest";
  hostName: string;
  guestName: string;
  hostResetAccepted: boolean;
  guestResetAccepted: boolean;
};

export function MultiplayerPlaytestClient({
  roomId,
  initialGameState,
  initialStateVersion,
  myPlayerId,
  myUserId,
  myRole,
  hostName,
  guestName,
  hostResetAccepted,
  guestResetAccepted,
}: Props) {
  const playerOrder = initialGameState.playerOrder;
  const opponentPlayerId =
    playerOrder.find((id) => id !== myPlayerId) ?? playerOrder[0] ?? myPlayerId;

  return (
    <MultiplayerGameProvider
      roomId={roomId}
      initialGameState={initialGameState}
      initialStateVersion={initialStateVersion}
      localPlayerId={myPlayerId}
      opponentPlayerId={opponentPlayerId}
      myRole={myRole}
      myUserId={myUserId}
      initialHostResetAccepted={hostResetAccepted}
      initialGuestResetAccepted={guestResetAccepted}
    >
      <MultiplayerPlaymat
        myRole={myRole}
        hostName={hostName}
        guestName={guestName}
      />
    </MultiplayerGameProvider>
  );
}
