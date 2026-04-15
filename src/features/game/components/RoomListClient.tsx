"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";

type RoomRow = {
  id: string;
  hostName: string;
  hostCollege: string | null;
  createdAt: string;
  isOwn: boolean;
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin === 1) return "1 min atrás";
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH}h atrás`;
}

export function RoomListClient({ initialRooms }: { initialRooms: RoomRow[] }) {
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe("lobby");

    channel.bind("room-opened", () => router.refresh());
    channel.bind("room-closed", () => router.refresh());

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("lobby");
    };
  }, [router]);

  if (initialRooms.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-4xl">🃏</p>
        <p className="text-base font-semibold text-white/60">
          Nenhuma sala aberta no momento.
        </p>
        <p className="text-sm text-white/30">
          Crie uma sala e convide um amigo.
        </p>
        <Link
          href="/game/new"
          className="mt-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.08] transition-colors"
        >
          + Nova sala
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {initialRooms.map((room) => (
        <li key={room.id}>
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-5 py-4 transition hover:border-white/15 hover:bg-white/[0.04]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {room.hostName}
                </span>
                {room.isOwn && (
                  <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    sua sala
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                {room.hostCollege && (
                  <span className="text-white/55">{room.hostCollege}</span>
                )}
                <span>{relativeTime(room.createdAt)}</span>
              </div>
            </div>

            <Link
              href={`/game/${room.id}`}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                room.isOwn
                  ? "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
                  : "bg-[#4d6393] text-white hover:bg-[#5f77ab]"
              }`}
            >
              {room.isOwn ? "Abrir" : "Entrar"}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
