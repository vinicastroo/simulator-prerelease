"use client";

import Image from "next/image";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GameSettingsMenu } from "@/components/GameSettingsMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardBack } from "@/features/playtest/components/CardBack";
import { Playmat } from "@/features/playtest/components/Playmat";
import { PreviewOverlay } from "@/features/playtest/components/playmat/PreviewOverlay";
import type {
  CardHoverInfo,
  PreviewAnchor,
} from "@/features/playtest/components/playmat/types";
import { useDeckLoader } from "@/features/playtest/hooks/useDeckLoader";
import { useGameStore } from "@/features/playtest/hooks/useGameStore";
import { GameProvider } from "@/features/playtest/store/GameProvider";
import { shuffleCardIds } from "@/lib/game/shuffle";
import type { CardDefinition, CardInstance } from "@/lib/game/types";

type PlaytestInitialDeck = {
  definitions: CardDefinition[];
  instances: CardInstance[];
};

type OpeningHandCard = {
  id: string;
  name: string;
  imageUrl: string | null;
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
  showOpeningHand,
  simulatorKitId,
}: {
  playerName: string;
  enableDeckTools: boolean;
  showOpeningHand: boolean;
  simulatorKitId?: string;
}) {
  const { state, dispatch, localPlayerId, reset } = useGameStore();
  const didPrepareOpeningHandRef = useRef(false);
  const [isOpeningHandOpen, setIsOpeningHandOpen] = useState(showOpeningHand);
  const [openingHandIds, setOpeningHandIds] = useState<string[]>([]);

  const handleReset = useCallback(() => {
    didPrepareOpeningHandRef.current = false;
    setOpeningHandIds([]);
    setIsOpeningHandOpen(showOpeningHand);
    reset();
  }, [reset, showOpeningHand]);

  const openingHandCards = openingHandIds
    .map((cardId) => {
      const instance = state.cardInstances[cardId];
      if (!instance) return null;

      const definition = state.cardDefinitions[instance.definitionId];
      if (!definition) return null;

      return {
        id: cardId,
        name: definition.name,
        imageUrl: definition.imageUrl,
      } satisfies OpeningHandCard;
    })
    .filter((card): card is OpeningHandCard => card !== null);

  const isPreparingOpeningHand =
    isOpeningHandOpen && openingHandCards.length === 0;

  const drawOpeningHand = useCallback(
    (libraryIds: string[]) => {
      if (libraryIds.length === 0) return;

      setIsOpeningHandOpen(true);

      const shuffledLibrary = shuffleCardIds(libraryIds);
      const nextOpeningHandIds = shuffledLibrary.slice(0, 7);

      dispatch({
        type: "zone/shuffle",
        playerId: localPlayerId,
        zone: "library",
        orderedIds: shuffledLibrary,
      });
      dispatch({
        type: "card/draw",
        playerId: localPlayerId,
        count: nextOpeningHandIds.length,
      });

      setOpeningHandIds(nextOpeningHandIds);
      setIsOpeningHandOpen(true);
    },
    [dispatch, localPlayerId],
  );

  useEffect(() => {
    if (!showOpeningHand || didPrepareOpeningHandRef.current) return;

    const player = state.players[localPlayerId];
    if (!player) return;
    if (player.zones.library.length === 0 || player.zones.hand.length > 0)
      return;

    didPrepareOpeningHandRef.current = true;
    drawOpeningHand(player.zones.library);
  }, [drawOpeningHand, localPlayerId, showOpeningHand, state.players]);

  const handleMulligan = useCallback(() => {
    const player = state.players[localPlayerId];
    if (!player) return;

    const handIds = [...player.zones.hand];
    const nextLibraryIds = [...player.zones.library, ...handIds];
    if (nextLibraryIds.length === 0) return;

    if (handIds.length > 0) {
      dispatch({
        type: "card/moveMany",
        cardIds: handIds,
        to: "library",
        toPlayerId: localPlayerId,
      });
    }

    drawOpeningHand(nextLibraryIds);
  }, [dispatch, drawOpeningHand, localPlayerId, state.players]);

  const handleKeepOpeningHand = useCallback(() => {
    setIsOpeningHandOpen(false);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Playmat playerName={playerName} />
      {enableDeckTools && <DeckLoaderPanel />}
      <GameSettingsMenu
        onReset={handleReset}
        collectionHref="/decks"
        simulatorHref={
          simulatorKitId ? `/simulator/${simulatorKitId}` : undefined
        }
      />
      <OpeningHandModal
        cards={openingHandCards}
        open={isOpeningHandOpen}
        preparing={isPreparingOpeningHand}
        onKeep={handleKeepOpeningHand}
        onMulligan={handleMulligan}
      />
    </div>
  );
}

function OpeningHandModal({
  open,
  cards,
  preparing,
  onMulligan,
  onKeep,
}: {
  open: boolean;
  cards: OpeningHandCard[];
  preparing: boolean;
  onMulligan: () => void;
  onKeep: () => void;
}) {
  const [previewCard, setPreviewCard] = useState<CardHoverInfo | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<PreviewAnchor | null>(
    null,
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
        <div className="w-full max-w-6xl rounded-[1.75rem] border border-white/10 bg-[#0d1017] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-6">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#91a7da]">
                Mao inicial
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                Escolha sua mao de abertura
              </h2>
              <p className="mt-1 text-sm text-white/45">
                {preparing
                  ? "Preparando sua mao inicial..."
                  : `O grimorio ja foi embaralhado. Voce pode ficar com estas ${cards.length} cartas ou pedir mulligan.`}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
            {preparing
              ? Array.from({ length: 7 }, (_, slot) => slot + 1).map((slot) => (
                  <div
                    key={`placeholder-${slot}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="relative h-[167px] w-[120px] overflow-hidden rounded-[10px] border border-white/10 bg-black/20 shadow-lg sm:h-[209px] sm:w-[150px]">
                      <CardBack className="h-full w-full rounded-[10px] opacity-70" />
                    </div>
                    <span className="max-w-[120px] text-center text-[10px] text-white/30 sm:max-w-[150px]">
                      Carregando...
                    </span>
                  </div>
                ))
              : cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className="flex flex-col items-center gap-2 bg-transparent p-0 text-inherit"
                    onMouseEnter={(event) => {
                      setPreviewCard({
                        name: card.name,
                        imageUrl: card.imageUrl,
                      });
                      const rect = event.currentTarget.getBoundingClientRect();
                      setPreviewAnchor({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => {
                      setPreviewCard(null);
                      setPreviewAnchor(null);
                    }}
                  >
                    <div className="relative h-[167px] w-[120px] overflow-hidden rounded-[10px] border border-white/10 bg-black/20 shadow-lg sm:h-[209px] sm:w-[150px]">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          width={150}
                          height={209}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <CardBack className="h-full w-full rounded-[10px]" />
                      )}
                    </div>
                    <span className="max-w-[120px] text-center text-[10px] text-white/55 sm:max-w-[150px]">
                      {card.name}
                    </span>
                  </button>
                ))}
          </div>

          {preparing ? (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm text-white/55">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
              <span>Carregando mao inicial...</span>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]"
              onClick={onMulligan}
              disabled={preparing}
            >
              Mulligan
            </Button>
            <Button
              type="button"
              className="bg-[#4d6393] text-white hover:bg-[#5f77ab]"
              onClick={onKeep}
              disabled={preparing}
            >
              Ficar com a mao
            </Button>
          </div>
        </div>
      </div>
      <PreviewOverlay previewCard={previewCard} previewAnchor={previewAnchor} />
    </>
  );
}

export function PlaytestClient({
  initialDeck,
  playerName = "Você",
  enableDeckTools = false,
  simulatorKitId,
}: {
  initialDeck?: PlaytestInitialDeck;
  playerName?: string;
  enableDeckTools?: boolean;
  simulatorKitId?: string;
}) {
  return (
    <GameProvider playerName={playerName} initialDeck={initialDeck}>
      <PlaytestSurface
        playerName={playerName}
        enableDeckTools={enableDeckTools}
        showOpeningHand={Boolean(initialDeck)}
        simulatorKitId={simulatorKitId}
      />
    </GameProvider>
  );
}
