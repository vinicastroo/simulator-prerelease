"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Playmat } from "@/features/playtest/components/Playmat";
import { useDeckLoader } from "@/features/playtest/hooks/useDeckLoader";
import { useGameStore } from "@/features/playtest/hooks/useGameStore";
import { GameProvider } from "@/features/playtest/store/GameProvider";
import type { CardDefinition, CardInstance } from "@/lib/game/types";

type PlaytestInitialDeck = {
  definitions: CardDefinition[];
  instances: CardInstance[];
};

function DeckLoaderPanel() {
  const { dispatch, localPlayerId, zoneCount } = useGameStore();
  const { loaderState, loadDeck, loadDefault } = useDeckLoader(
    localPlayerId,
    dispatch,
  );
  const [isOpen, setIsOpen] = useState(true);
  const [deckUrl, setDeckUrl] = useState("");
  const [drawCount, setDrawCount] = useState("1");
  const [millCount, setMillCount] = useState("1");

  useEffect(() => {
    if (loaderState.status === "error") {
      setIsOpen(true);
    }
  }, [loaderState.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextUrl = deckUrl.trim();
    if (!nextUrl) return;
    await loadDeck(nextUrl);
  }

  function toPositiveCount(value: string) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }

  function handleDrawMany() {
    const count = toPositiveCount(drawCount);
    if (!count || zoneCount("library") === 0) return;
    dispatch({ type: "card/draw", playerId: localPlayerId, count });
  }

  function handleMillMany() {
    const count = toPositiveCount(millCount);
    if (!count || zoneCount("library") === 0) return;
    dispatch({ type: "card/mill", playerId: localPlayerId, count });
  }

  return (
    <div className="pointer-events-none absolute left-4 top-12 z-40 flex max-w-[min(360px,calc(100vw-2rem))] flex-col items-start gap-2">
      <button
        type="button"
        className="pointer-events-auto rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md transition hover:bg-black/80"
        onClick={() => setIsOpen((current) => !current)}
      >
        Deck Tools
      </button>

      {isOpen && (
        <div className="pointer-events-auto w-full rounded-2xl border border-white/10 bg-black/78 p-3 shadow-[0_18px_42px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/72">
                Ferramentas de deck
              </p>
              <p className="mt-1 text-[11px] text-white/40">
                O fluxo principal vem do simulator. URL manual fica como
                fallback.
              </p>
            </div>

            <Badge
              variant="outline"
              className="border-white/10 bg-white/[0.04] text-[10px] text-white/60"
            >
              {loaderState.status === "loading"
                ? "Loading"
                : loaderState.status === "loaded"
                  ? "Loaded"
                  : loaderState.status === "error"
                    ? "Error"
                    : "Idle"}
            </Badge>
          </div>

          <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
            <Input
              value={deckUrl}
              onChange={(event) => setDeckUrl(event.target.value)}
              placeholder="https://.../deck.json"
              className="h-8 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25"
            />
            <Button
              type="submit"
              size="sm"
              className="border border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.12]"
              disabled={loaderState.status === "loading"}
            >
              Abrir
            </Button>
          </form>

          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.08]"
              onClick={() => void loadDefault()}
              disabled={loaderState.status === "loading"}
            >
              Fallback padrão
            </Button>

            {loaderState.status === "loaded" && loaderState.deckName && (
              <span className="inline-flex items-center rounded-full border border-[#294a31] bg-[#132317] px-2.5 py-1 text-[10px] text-[#9fddb0]">
                {loaderState.deckName}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/58">
                Draw X
              </p>
              <div className="mt-2 flex gap-2">
                <Input
                  inputMode="numeric"
                  value={drawCount}
                  onChange={(event) => setDrawCount(event.target.value)}
                  className="h-8 border-white/10 bg-black/20 text-sm text-white"
                />
                <Button
                  type="button"
                  size="sm"
                  className="border border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.12]"
                  onClick={handleDrawMany}
                  disabled={
                    loaderState.status === "loading" ||
                    zoneCount("library") === 0
                  }
                >
                  Draw
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/58">
                Mill N
              </p>
              <div className="mt-2 flex gap-2">
                <Input
                  inputMode="numeric"
                  value={millCount}
                  onChange={(event) => setMillCount(event.target.value)}
                  className="h-8 border-white/10 bg-black/20 text-sm text-white"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.08]"
                  onClick={handleMillMany}
                  disabled={
                    loaderState.status === "loading" ||
                    zoneCount("library") === 0
                  }
                >
                  Mill
                </Button>
              </div>
            </div>
          </div>

          {loaderState.status === "error" && (
            <p className="mt-2 rounded-xl border border-[#5d2525] bg-[#2a1212] px-3 py-2 text-[11px] text-[#f0b3b3]">
              {loaderState.message}
            </p>
          )}

          {loaderState.status === "loading" && (
            <p className="mt-2 text-[11px] text-white/45">Carregando deck...</p>
          )}
        </div>
      )}
    </div>
  );
}

function PlaytestSurface({
  playerName,
  enableDeckTools,
}: {
  playerName: string;
  enableDeckTools: boolean;
}) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Playmat playerName={playerName} />
      {enableDeckTools && <DeckLoaderPanel />}
    </div>
  );
}

export function PlaytestClient({
  initialDeck,
  playerName = "Você",
  enableDeckTools = false,
}: {
  initialDeck?: PlaytestInitialDeck;
  playerName?: string;
  enableDeckTools?: boolean;
}) {
  return (
    <GameProvider playerName={playerName} initialDeck={initialDeck}>
      <PlaytestSurface
        playerName={playerName}
        enableDeckTools={enableDeckTools}
      />
    </GameProvider>
  );
}
