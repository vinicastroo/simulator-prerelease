"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getPusherClient } from "@/lib/pusher-client";

type Kit = { id: string; college: string } | null;
type UserInfo = { id: string; name: string } | null;
type OwnKit = { id: string; college: string };

type Props = {
  roomId: string;
  myRole: "host" | "guest";
  myKitId: string | null;
  hostUser: UserInfo;
  guestUser: UserInfo;
  hostReady: boolean;
  guestReady: boolean;
  hostKit: Kit;
  guestKit: Kit;
  kits: OwnKit[];
};

function collegeLabel(college: string) {
  return college.charAt(0) + college.slice(1).toLowerCase();
}

export function GameLobby({
  roomId,
  myRole,
  myKitId,
  hostUser,
  guestUser,
  hostReady: initialHostReady,
  guestReady: initialGuestReady,
  hostKit: initialHostKit,
  guestKit: initialGuestKit,
  kits,
}: Props) {
  const router = useRouter();
  const [hostReady, setHostReady] = useState(initialHostReady);
  const [guestReady, setGuestReady] = useState(initialGuestReady);
  const [guestJoined, setGuestJoined] = useState(guestUser !== null);
  const [guestName, setGuestName] = useState<string | null>(guestUser?.name ?? null);
  const [selectedKitId, setSelectedKitId] = useState<string>(myKitId ?? "");
  const [kitSaved, setKitSaved] = useState(false);
  const [isPendingKit, startKitTransition] = useTransition();
  const [isPendingReady, startReadyTransition] = useTransition();
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/game/${roomId}`
      : "";

  // Pusher subscriptions
  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(`game-${roomId}`);

    channel.bind("player-joined", (data: { userId: string; name: string }) => {
      setGuestJoined(true);
      setGuestName(data.name);
    });

    channel.bind("player-ready", (data: { role: "host" | "guest" }) => {
      if (data.role === "host") setHostReady(true);
      if (data.role === "guest") setGuestReady(true);
    });

    channel.bind("game-started", () => {
      window.location.reload();
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`game-${roomId}`);
    };
  }, [roomId, router]);

  // Broadcast join when guest lands on page
  useEffect(() => {
    if (myRole === "guest") {
      void fetch(`/api/game/${roomId}/join`, { method: "POST" });
    }
  }, [myRole, roomId]);

  function handleSaveKit() {
    if (!selectedKitId) return;
    startKitTransition(async () => {
      const res = await fetch(`/api/game/${roomId}/kit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitId: selectedKitId }),
      });
      if (res.ok) setKitSaved(true);
    });
  }

  function handleReady() {
    startReadyTransition(async () => {
      await fetch(`/api/game/${roomId}/ready`, { method: "POST" });
    });
  }

  const myReady = myRole === "host" ? hostReady : guestReady;
  const canReady = kitSaved || Boolean(myKitId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0b0e14] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1017] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#91a7da]">
          Sala
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
          Aguardando jogadores
        </h1>

        {/* Invite link (host only) */}
        {myRole === "host" && (
          <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Link de convite
            </p>
            <p className="mt-1 break-all font-mono text-xs text-white/80">
              {inviteUrl}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
              onClick={() => void navigator.clipboard.writeText(inviteUrl)}
            >
              Copiar
            </Button>
          </div>
        )}

        {/* Players */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <PlayerCard
            label="Host"
            user={hostUser}
            kit={initialHostKit}
            ready={hostReady}
          />
          <PlayerCard
            label="Convidado"
            user={guestJoined ? (guestName ? { id: "", name: guestName } : guestUser) : null}
            kit={initialGuestKit}
            ready={guestReady}
            waiting={!guestJoined}
          />
        </div>

        {/* Kit selector */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Seu kit
          </p>
          {kits.length === 0 ? (
            <p className="mt-2 text-sm text-white/40">
              Nenhum kit disponível. Crie um no simulador.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {kits.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => {
                    setSelectedKitId(kit.id);
                    setKitSaved(false);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedKitId === kit.id
                      ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08]"
                  }`}
                >
                  {collegeLabel(kit.college)}
                </button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
                disabled={!selectedKitId || isPendingKit || kitSaved}
                onClick={handleSaveKit}
              >
                {kitSaved ? "Salvo" : "Salvar kit"}
              </Button>
            </div>
          )}
        </div>

        {/* Ready button */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <Button
            type="button"
            className={`w-full ${
              myReady
                ? "bg-green-700/60 text-green-200 cursor-not-allowed"
                : "bg-[#4d6393] text-white hover:bg-[#5f77ab]"
            }`}
            disabled={myReady || !canReady || isPendingReady}
            onClick={handleReady}
          >
            {myReady
              ? "Pronto!"
              : isPendingReady
                ? "Aguarde..."
                : "Estou pronto"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  label,
  user,
  kit,
  ready,
  waiting = false,
}: {
  label: string;
  user: UserInfo;
  kit: Kit;
  ready: boolean;
  waiting?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </p>
      {waiting ? (
        <p className="mt-1 text-sm text-white/30 italic">Aguardando...</p>
      ) : (
        <p className="mt-1 text-sm font-semibold text-white">
          {user?.name ?? "—"}
        </p>
      )}
      {kit && (
        <p className="mt-0.5 text-[11px] text-white/50">
          {collegeLabel(kit.college)}
        </p>
      )}
      <div
        className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          ready ? "bg-green-900/40 text-green-300" : "bg-white/5 text-white/30"
        }`}
      >
        {ready ? "Pronto" : "Aguardando"}
      </div>
    </div>
  );
}
