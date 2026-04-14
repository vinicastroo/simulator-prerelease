"use client";

import {
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { selectCardWithDefinition } from "@/lib/game/selectors";
import type { CardInstance, ZoneName } from "@/lib/game/types";
import { useGameStore } from "../hooks/useGameStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { CardBack } from "./CardBack";
import { CardPreview } from "./CardPreview";
import { TokenModal } from "./TokenModal";

const GRID_SIZE = 40;
const BATTLEFIELD_CARD_WIDTH = 121;
const BATTLEFIELD_CARD_HEIGHT = 185;
const BATTLEFIELD_ZOOM_MIN = 0.6;
const BATTLEFIELD_ZOOM_MAX = 1.8;
const BATTLEFIELD_ZOOM_STEP = 0.08;

type DragCardData = {
  cardId: string;
  from: ZoneName;
};

type CardHoverInfo = {
  name: string;
  imageUrl: string | null;
};

type PreviewAnchor = {
  x: number;
  y: number;
};

function parseManaCost(cost: string) {
  if (!cost) return [];
  const matches = cost.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((token) =>
    token.replace(/[{}]/g, "").replaceAll("/", "").toUpperCase(),
  );
}

function getDropClientPosition(event: DragEndEvent) {
  const translated = event.active.rect.current.translated;
  if (translated) {
    return {
      clientX: translated.left + translated.width / 2,
      clientY: translated.top + translated.height / 2,
    };
  }

  const initial = event.active.rect.current.initial;
  if (initial) {
    return {
      clientX: initial.left + initial.width / 2 + event.delta.x,
      clientY: initial.top + initial.height / 2 + event.delta.y,
    };
  }

  return null;
}

function snapToGrid(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function isZoneName(value: string): value is ZoneName {
  return (
    value === "library" ||
    value === "hand" ||
    value === "battlefield" ||
    value === "graveyard" ||
    value === "exile" ||
    value === "sideboard" ||
    value === "command"
  );
}

function ManaCostBadges({
  cardId,
  symbols,
}: {
  cardId: string;
  symbols: string[];
}) {
  if (symbols.length === 0) return null;

  const occurrences: Record<string, number> = {};
  const keyedSymbols = symbols.map((symbol) => {
    const nextCount = (occurrences[symbol] ?? 0) + 1;
    occurrences[symbol] = nextCount;
    return {
      symbol,
      key: `${cardId}-${symbol}-${nextCount}`,
    };
  });

  return (
    <div className="absolute -top-2 -left-2 z-30 flex items-center -space-x-1">
      {keyedSymbols.map(({ symbol, key }) => (
        <div
          key={key}
          className="flex h-4 w-4 items-center justify-center rounded-full bg-black shadow-md ring-1 ring-white/30"
        >
          <Image
            src={`/${symbol}.svg`}
            alt={symbol}
            width={14}
            height={14}
            className="h-[80%] w-[80%] object-contain"
            draggable={false}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

type HandCardProps = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  index: number;
  total: number;
  isAnyDragActive: boolean;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
};

const HandCard = memo(function HandCard({
  card,
  name,
  imageUrl,
  manaCost,
  index,
  total,
  isAnyDragActive,
  onHover,
}: HandCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        cardId: card.id,
        from: "hand",
      } satisfies DragCardData,
    });

  const symbols = useMemo(() => parseManaCost(manaCost), [manaCost]);

  const cardW = 121;
  const cardH = 185;
  const spacing = 45;
  const xOffset = (index - (total - 1) / 2) * spacing;
  const rotate = (index - (total - 1) / 2) * 3;
  const yOffset = Math.abs(index - (total - 1) / 2) * 4;

  const dragTransform = transform ? CSS.Translate.toString(transform) : "";
  const baseTransform = `translateX(calc(-50% + ${xOffset}px)) translateY(${yOffset}px) rotate(${rotate}deg)`;
  const combinedTransform = dragTransform
    ? `${dragTransform} ${baseTransform}`
    : baseTransform;

  return (
    <button
      ref={setNodeRef}
      type="button"
      draggable={false}
      className={`absolute bottom-4 cursor-pointer select-none touch-none transition-all duration-200 ease-out ${
        isAnyDragActive
          ? ""
          : "hover:-translate-y-12 hover:z-[100] hover:scale-125"
      }`}
      style={{
        left: "50%",
        transform: combinedTransform,
        zIndex: isDragging ? 200 : index,
        transformOrigin: "bottom center",
        transition: isDragging ? "none" : undefined,
      }}
      onMouseEnter={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseMove={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseLeave={() => onHover(null, null)}
      onContextMenu={(event) => event.preventDefault()}
      {...listeners}
      {...attributes}
    >
      <div className="relative group">
        <ManaCostBadges cardId={card.id} symbols={symbols} />

        {imageUrl ? (
          <div
            className="overflow-hidden rounded-[6px] border border-white/10 bg-zinc-900 shadow-xl"
            style={{ width: `${cardW}px`, height: `${cardH}px` }}
          >
            <Image
              src={imageUrl}
              alt={name}
              width={cardW}
              height={cardH}
              className="h-full w-full object-cover"
              draggable={false}
              unoptimized
            />
          </div>
        ) : (
          <div style={{ width: `${cardW}px`, height: `${cardH}px` }}>
            <CardBack className="h-full w-full" />
          </div>
        )}
      </div>
    </button>
  );
});

type BattlefieldCardProps = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
  cardType: string;
  power: string | null;
  toughness: string | null;
  onHover: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
  onTap: () => void;
};

const BattlefieldCard = memo(function BattlefieldCard({
  card,
  name,
  imageUrl,
  manaCost,
  cardType,
  power,
  toughness,
  onHover,
  onTap,
}: BattlefieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        cardId: card.id,
        from: "battlefield",
      } satisfies DragCardData,
    });

  const symbols = useMemo(() => parseManaCost(manaCost), [manaCost]);
  const isCreature = useMemo(() => {
    if (card.faceDown) return false;
    return cardType.toLowerCase().includes("creature");
  }, [card.faceDown, cardType]);
  const dragTransform = transform ? CSS.Translate.toString(transform) : "";
  const combinedTransform = `${dragTransform ? `${dragTransform} ` : ""}${
    !isDragging && card.tapped ? "rotate(90deg)" : ""
  }`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      draggable={false}
      className="absolute cursor-pointer select-none touch-none border-0 bg-transparent p-0 outline-none transition-transform duration-200 hover:scale-105 hover:z-10 focus:outline-none focus-visible:outline-none"
      style={{
        transformOrigin: "center bottom",
        left: card.battlefield?.x ?? 0,
        top: card.battlefield?.y ?? 0,
        transform: combinedTransform,
        zIndex: isDragging ? 999 : (card.battlefield?.z ?? 0) + 20,
        transition: isDragging ? "none" : undefined,
      }}
      onMouseEnter={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseMove={(event) => onHover({ name, imageUrl }, event.currentTarget)}
      onMouseLeave={() => onHover(null, null)}
      onClick={onTap}
      onContextMenu={(event) => event.preventDefault()}
      {...listeners}
      {...attributes}
    >
      <div
        className="relative"
        style={{
          width: `${BATTLEFIELD_CARD_WIDTH}px`,
          height: `${BATTLEFIELD_CARD_HEIGHT}px`,
        }}
      >
        <ManaCostBadges cardId={card.id} symbols={symbols} />

        {imageUrl ? (
          <div
            className="overflow-hidden rounded-[4px] shadow-md"
            style={{
              width: `${BATTLEFIELD_CARD_WIDTH}px`,
              height: `${BATTLEFIELD_CARD_HEIGHT}px`,
            }}
          >
            <Image
              src={imageUrl}
              alt={name}
              width={BATTLEFIELD_CARD_WIDTH}
              height={BATTLEFIELD_CARD_HEIGHT}
              className="h-full w-full rounded-[4px] border border-white/10 object-cover"
              draggable={false}
              unoptimized
            />
          </div>
        ) : (
          <CardBack className="h-full w-full" />
        )}

        {card.battlefield?.attachedTo && (
          <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-blue-600 text-[8px] text-white shadow-lg">
            L
          </div>
        )}

        {card.battlefield?.attachments &&
          card.battlefield.attachments.length > 0 && (
            <div className="absolute -top-2 -left-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-orange-600 text-[8px] text-white shadow-lg">
              {card.battlefield.attachments.length}
            </div>
          )}

        {Object.entries(card.counters).some(([, value]) => value > 0) && (
          <div className="absolute -bottom-1 left-0 right-0 flex flex-wrap justify-center gap-0.5">
            {Object.entries(card.counters)
              .filter(([, value]) => value > 0)
              .map(([counter, value]) => (
                <span
                  key={counter}
                  className="rounded-full bg-black/80 px-1 text-[8px] leading-tight text-white"
                >
                  {counter === "+1/+1"
                    ? `+${value}`
                    : counter === "-1/-1"
                      ? `-${value}`
                      : `${counter}:${value}`}
                </span>
              ))}
          </div>
        )}

        {isCreature && power !== null && toughness !== null && (
          <div className="absolute -bottom-2 right-0 z-30 flex items-center gap-0.5">
            <span className="flex h-5 min-w-5 items-center justify-center rounded-sm border border-white/30 bg-black/85 px-1 text-[10px] font-bold leading-none text-white">
              {power}
            </span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-sm border border-white/30 bg-black/85 px-1 text-[10px] font-bold leading-none text-white">
              {toughness}
            </span>
          </div>
        )}
      </div>
    </button>
  );
});

type StackTopCardProps = {
  cardId: string;
  zone: "graveyard" | "exile";
  name: string;
  imageUrl: string | null;
};

const StackTopCard = memo(function StackTopCard({
  cardId,
  zone,
  name,
  imageUrl,
}: StackTopCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: cardId,
    data: {
      cardId,
      from: zone,
    } satisfies DragCardData,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="absolute inset-0"
      {...listeners}
      {...attributes}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={68}
          height={96}
          className="h-[96px] w-[68px] rounded-[8px] border border-white/10 object-cover"
          draggable={false}
          unoptimized
        />
      ) : (
        <CardBack className="h-[96px] w-[68px]" />
      )}
    </button>
  );
});

type DeckTopCardProps = {
  cardId: string;
};

const DeckTopCard = memo(function DeckTopCard({ cardId }: DeckTopCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: cardId,
    data: {
      cardId,
      from: "library",
    } satisfies DragCardData,
  });

  return (
    <span
      ref={setNodeRef}
      className="absolute inset-0"
      {...listeners}
      {...attributes}
    />
  );
});

export function Playmat({ playerName = "Você" }: { playerName?: string }) {
  const {
    state,
    dispatch,
    undo,
    redo,
    localPlayerId,
    player,
    allZones,
    zoneCount,
  } = useGameStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const graveyardRef = useRef<HTMLDivElement | null>(null);
  const exileRef = useRef<HTMLDivElement | null>(null);
  const libraryRef = useRef<HTMLButtonElement | null>(null);

  const [previewCard, setPreviewCard] = useState<CardHoverInfo | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<PreviewAnchor | null>(
    null,
  );
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [focusedBattlefieldCardId, setFocusedBattlefieldCardId] = useState<
    string | null
  >(null);
  const [battlefieldZoom, setBattlefieldZoom] = useState(1);

  const [activeDrag, setActiveDrag] = useState<DragCardData | null>(null);

  const handDrop = useDroppable({ id: "hand" });
  const battlefieldDrop = useDroppable({ id: "battlefield" });
  const graveyardDrop = useDroppable({ id: "graveyard" });
  const exileDrop = useDroppable({ id: "exile" });
  const libraryDrop = useDroppable({ id: "library" });

  const updatePreviewAnchor = useCallback((target: HTMLElement | null) => {
    if (!target) {
      setPreviewAnchor(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setPreviewAnchor({
      x: rect.left + rect.width / 2,
      y: Math.max(12, rect.top - 10),
    });
  }, []);

  const handleHover = useCallback((info: CardHoverInfo | null) => {
    setPreviewCard(info);
  }, []);

  const handleDraw = useCallback(() => {
    if (zoneCount("library") === 0) return;
    dispatch({ type: "card/draw", playerId: localPlayerId, count: 1 });
  }, [dispatch, localPlayerId, zoneCount]);

  const handleShuffle = useCallback(() => {
    const library = [...state.players[localPlayerId].zones.library];
    for (let i = library.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [library[i], library[j]] = [library[j], library[i]];
    }
    dispatch({
      type: "zone/shuffle",
      playerId: localPlayerId,
      zone: "library",
      orderedIds: library,
    });
  }, [dispatch, localPlayerId, state.players]);

  const resetDragState = useCallback(() => {
    setActiveDrag(null);
  }, []);

  const getNextBattlefieldZ = useCallback(() => {
    return (
      allZones.battlefield.reduce((max, card) => {
        const cardZ = card.battlefield?.z ?? 0;
        return Math.max(max, cardZ);
      }, 0) + 1
    );
  }, [allZones.battlefield]);

  const getBattlefieldDropPosition = useCallback(
    (clientX: number, clientY: number) => {
      const rect = battlefieldRef.current?.getBoundingClientRect();
      const currentCount = allZones.battlefield.length;
      if (!rect) {
        return {
          x: 120 + (currentCount % 6) * 82,
          y: 80 + Math.floor(currentCount / 6) * 110,
          z: getNextBattlefieldZ(),
        };
      }

      const battlefieldWidth = rect.width / battlefieldZoom;
      const battlefieldHeight = rect.height / battlefieldZoom;
      const rawX = snapToGrid(
        (clientX - rect.left) / battlefieldZoom - BATTLEFIELD_CARD_WIDTH / 2,
      );
      const rawY = snapToGrid(
        (clientY - rect.top) / battlefieldZoom - BATTLEFIELD_CARD_HEIGHT / 2,
      );

      return {
        x: Math.max(
          12,
          Math.min(rawX, battlefieldWidth - BATTLEFIELD_CARD_WIDTH - 12),
        ),
        y: Math.max(
          12,
          Math.min(rawY, battlefieldHeight - BATTLEFIELD_CARD_HEIGHT - 12),
        ),
        z: getNextBattlefieldZ(),
      };
    },
    [allZones.battlefield.length, battlefieldZoom, getNextBattlefieldZ],
  );

  const clampBattlefieldZoom = useCallback((value: number) => {
    return Math.max(
      BATTLEFIELD_ZOOM_MIN,
      Math.min(value, BATTLEFIELD_ZOOM_MAX),
    );
  }, []);

  const adjustBattlefieldZoom = useCallback(
    (delta: number) => {
      setBattlefieldZoom((prev) => clampBattlefieldZoom(prev + delta));
    },
    [clampBattlefieldZoom],
  );

  const handleBattlefieldWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const delta =
        event.deltaY < 0 ? BATTLEFIELD_ZOOM_STEP : -BATTLEFIELD_ZOOM_STEP;
      adjustBattlefieldZoom(delta);
    },
    [adjustBattlefieldZoom],
  );

  const handleCardTap = useCallback(
    (card: CardInstance) => {
      dispatch({
        type: "card/setTapped",
        cardId: card.id,
        tapped: !card.tapped,
      });
    },
    [dispatch],
  );

  const handleTapFocusedBattlefieldCard = useCallback(() => {
    if (!focusedBattlefieldCardId) return;

    const card = state.cardInstances[focusedBattlefieldCardId];
    if (!card || card.zone !== "battlefield") return;

    dispatch({
      type: "card/setTapped",
      cardId: card.id,
      tapped: !card.tapped,
    });
  }, [dispatch, focusedBattlefieldCardId, state.cardInstances]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragData = event.active.data.current as DragCardData | undefined;
    if (!dragData) return;

    setActiveDrag(dragData);
  }, []);

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      resetDragState();
    },
    [resetDragState],
  );

  const resolveDropZone = useCallback(
    (event: DragEndEvent, dragData: DragCardData) => {
      const overId = event.over?.id;
      if (overId && isZoneName(String(overId))) {
        return String(overId) as ZoneName;
      }

      const cursor = getDropClientPosition(event);
      if (cursor) {
        const zonesByPriority: Array<{
          zone: ZoneName;
          rect: DOMRect | null | undefined;
        }> = [
          {
            zone: "graveyard",
            rect: graveyardRef.current?.getBoundingClientRect(),
          },
          { zone: "exile", rect: exileRef.current?.getBoundingClientRect() },
          {
            zone: "library",
            rect: libraryRef.current?.getBoundingClientRect(),
          },
          { zone: "hand", rect: handRef.current?.getBoundingClientRect() },
          {
            zone: "battlefield",
            rect: battlefieldRef.current?.getBoundingClientRect(),
          },
        ];

        const zoneByCursor = zonesByPriority.find(({ rect }) => {
          if (!rect) return false;
          return (
            cursor.clientX >= rect.left &&
            cursor.clientX <= rect.right &&
            cursor.clientY >= rect.top &&
            cursor.clientY <= rect.bottom
          );
        });

        if (zoneByCursor) {
          return zoneByCursor.zone;
        }
      }

      if (overId && String(overId) !== dragData.cardId) {
        const overCard = state.cardInstances[String(overId)];
        if (overCard && isZoneName(overCard.zone)) {
          return overCard.zone;
        }
      }

      return null;
    },
    [state.cardInstances],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const dragData = event.active.data.current as DragCardData | undefined;
      if (!dragData) {
        resetDragState();
        return;
      }

      const toZone = resolveDropZone(event, dragData);
      if (!toZone) {
        resetDragState();
        return;
      }

      if (toZone === "battlefield") {
        if (dragData.from === "battlefield") {
          const dragDistance = Math.hypot(event.delta.x, event.delta.y);
          if (dragDistance < GRID_SIZE / 2) {
            resetDragState();
            return;
          }
        }

        const cursor = getDropClientPosition(event);
        const fallbackCard = state.cardInstances[dragData.cardId];

        const position = cursor
          ? getBattlefieldDropPosition(cursor.clientX, cursor.clientY)
          : {
              x: fallbackCard?.battlefield?.x ?? 80,
              y: fallbackCard?.battlefield?.y ?? 80,
              z: getNextBattlefieldZ(),
            };

        if (dragData.from !== "battlefield") {
          dispatch({
            type: "card/move",
            cardId: dragData.cardId,
            from: dragData.from,
            to: "battlefield",
            toPlayerId: localPlayerId,
          });
        }

        dispatch({
          type: "card/setBattlefieldPosition",
          cardId: dragData.cardId,
          x: position.x,
          y: position.y,
          z: position.z,
        });

        resetDragState();
        return;
      }

      if (dragData.from !== toZone) {
        dispatch({
          type: "card/move",
          cardId: dragData.cardId,
          from: dragData.from,
          to: toZone,
          toPlayerId: localPlayerId,
        });
      }

      resetDragState();
    },
    [
      dispatch,
      getBattlefieldDropPosition,
      getNextBattlefieldZ,
      localPlayerId,
      resolveDropZone,
      resetDragState,
      state.cardInstances,
    ],
  );

  useKeyboardShortcuts({
    onTap: handleTapFocusedBattlefieldCard,
    onDraw: handleDraw,
    onShuffle: handleShuffle,
    onUndo: undo,
    onRedo: redo,
  });

  const life = player?.life ?? 20;

  const handCards = allZones.hand.map((card) => {
    const selected = selectCardWithDefinition(state, card.id);
    return {
      card,
      name: selected?.definition.name ?? "carta",
      imageUrl: selected?.definition.imageUrl ?? null,
      manaCost: selected?.definition.manaCost ?? "",
    };
  });

  const battlefieldCards = allZones.battlefield.map((card) => {
    const selected = selectCardWithDefinition(state, card.id);
    const definitionType = selected?.definition.type ?? "";
    const definitionPower = selected?.definition.power ?? null;
    const definitionToughness = selected?.definition.toughness ?? null;
    const cardType = card.tokenData?.type ?? definitionType;
    const power = card.tokenData?.power ?? definitionPower;
    const toughness = card.tokenData?.toughness ?? definitionToughness;

    return {
      card,
      name: selected?.definition.name ?? "carta",
      imageUrl: card.faceDown ? null : (selected?.definition.imageUrl ?? null),
      manaCost: selected?.definition.manaCost ?? "",
      cardType,
      power,
      toughness,
    };
  });

  const graveyardTop = allZones.graveyard.at(-1);
  const exileTop = allZones.exile.at(-1);
  const libraryTop = allZones.library[0] ?? null;

  const getStackTopInfo = useCallback(
    (card: CardInstance | undefined) => {
      if (!card) return null;
      const selected = selectCardWithDefinition(state, card.id);
      return {
        name:
          card.customName ??
          card.tokenData?.name ??
          selected?.definition.name ??
          "Carta",
        imageUrl:
          card.tokenData?.imageUrl ?? selected?.definition.imageUrl ?? null,
      };
    },
    [state],
  );

  const graveyardTopInfo = getStackTopInfo(graveyardTop);
  const exileTopInfo = getStackTopInfo(exileTop);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full w-full">
        <div className="flex h-full w-full flex-col justify-end gap-4 bg-red-200 px-4 py-4 text-white">
          <section className="rounded-2xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Jogador
                </p>
                <p className="text-2xl font-bold">{playerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-white/10 text-xl"
                  onClick={() =>
                    dispatch({
                      type: "player/changeLife",
                      playerId: localPlayerId,
                      delta: -1,
                      at: Date.now(),
                    })
                  }
                >
                  −
                </button>
                <span className="text-4xl font-black tabular-nums">{life}</span>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-white/10 text-xl"
                  onClick={() =>
                    dispatch({
                      type: "player/changeLife",
                      playerId: localPlayerId,
                      delta: 1,
                      at: Date.now(),
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section
            id="battlefield"
            className="flex h-full flex-1 flex-col gap-4 justify-end rounded-2xl"
          >
            <div
              ref={(node) => {
                battlefieldRef.current = node;
                battlefieldDrop.setNodeRef(node);
              }}
              className={`relative h-full min-h-[320px] w-full rounded-2xl border border-dashed border-white/25 bg-black/10 p-4 ${
                activeDrag
                  ? battlefieldDrop.isOver
                    ? "ring-2 ring-cyan-400/80 bg-cyan-500/10"
                    : "ring-1 ring-cyan-300/40 bg-cyan-500/5"
                  : ""
              }`}
              onWheel={handleBattlefieldWheel}
            >
              <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-semibold text-white/80">
                Zoom {Math.round(battlefieldZoom * 100)}%
              </div>

              <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 rounded-md border border-white/15 bg-black/30 px-2 text-[11px] font-semibold text-white/90"
                  onClick={() => adjustBattlefieldZoom(-BATTLEFIELD_ZOOM_STEP)}
                >
                  Zoom -
                </button>
                <button
                  type="button"
                  className="h-8 rounded-md border border-white/15 bg-black/30 px-2 text-[11px] font-semibold text-white/90"
                  onClick={() => setBattlefieldZoom(1)}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="h-8 rounded-md border border-white/15 bg-black/30 px-2 text-[11px] font-semibold text-white/90"
                  onClick={() => adjustBattlefieldZoom(BATTLEFIELD_ZOOM_STEP)}
                >
                  Zoom +
                </button>
              </div>

              <div
                className="relative h-full w-full"
                style={{
                  transform: `scale(${battlefieldZoom})`,
                  transformOrigin: "top left",
                  width: `${100 / battlefieldZoom}%`,
                  height: `${100 / battlefieldZoom}%`,
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                  backgroundPosition: "0 0",
                }}
              >
                {battlefieldCards.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex h-full items-center justify-center text-xs uppercase tracking-[0.35em] text-white/30">
                    Campo de batalha
                  </div>
                )}

                {battlefieldCards.map(
                  ({
                    card,
                    name,
                    imageUrl,
                    manaCost,
                    cardType,
                    power,
                    toughness,
                  }) => (
                    <BattlefieldCard
                      key={card.id}
                      card={card}
                      name={name}
                      imageUrl={imageUrl}
                      manaCost={manaCost}
                      cardType={cardType}
                      power={power}
                      toughness={toughness}
                      onHover={(info, target) => {
                        handleHover(info);
                        updatePreviewAnchor(target);
                        setFocusedBattlefieldCardId(info ? card.id : null);
                      }}
                      onTap={() => handleCardTap(card)}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="flex flex-col items-end justify-end gap-4 lg:flex-row">
              <div
                ref={(node) => {
                  handRef.current = node;
                  handDrop.setNodeRef(node);
                }}
                className={`relative flex h-full w-full items-center justify-center rounded-2xl p-4 ${
                  activeDrag
                    ? handDrop.isOver
                      ? "ring-2 ring-green-400/70 bg-green-500/10"
                      : "ring-1 ring-green-300/40 bg-green-500/5"
                    : ""
                }`}
              >
                {handCards.map(({ card, name, imageUrl, manaCost }, index) => (
                  <HandCard
                    key={card.id}
                    card={card}
                    name={name}
                    imageUrl={imageUrl}
                    manaCost={manaCost}
                    index={index}
                    total={handCards.length}
                    isAnyDragActive={Boolean(activeDrag)}
                    onHover={(info, target) => {
                      handleHover(info);
                      updatePreviewAnchor(target);
                      setFocusedBattlefieldCardId(null);
                    }}
                  />
                ))}

                {handCards.length === 0 && (
                  <div className="flex items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
                    Mão vazia
                  </div>
                )}
              </div>

              <aside className="flex flex-row gap-3 lg:w-48 lg:flex-col">
                {(
                  [
                    {
                      zone: "graveyard" as const,
                      label: "Cemitério",
                      top: graveyardTop,
                      topName: graveyardTopInfo?.name ?? "Carta",
                      topImageUrl: graveyardTopInfo?.imageUrl ?? null,
                      ref: graveyardDrop,
                    },
                    {
                      zone: "exile" as const,
                      label: "Exílio",
                      top: exileTop,
                      topName: exileTopInfo?.name ?? "Carta",
                      topImageUrl: exileTopInfo?.imageUrl ?? null,
                      ref: exileDrop,
                    },
                  ] as const
                ).map(({ zone, label, top, topName, topImageUrl, ref }) => (
                  <div
                    key={zone}
                    ref={(node) => {
                      if (zone === "graveyard") {
                        graveyardRef.current = node;
                      } else {
                        exileRef.current = node;
                      }
                      ref.setNodeRef(node);
                    }}
                    className={`relative flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-xs uppercase tracking-[0.2em] ${
                      activeDrag
                        ? ref.isOver
                          ? "ring-2 ring-white/80 bg-white/10"
                          : "ring-1 ring-white/35 bg-white/[0.05]"
                        : ""
                    }`}
                  >
                    <span>{label}</span>

                    <div className="relative flex h-[96px] w-[68px] items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.02]">
                      {top ? (
                        <StackTopCard
                          cardId={top.id}
                          zone={zone}
                          name={topName}
                          imageUrl={topImageUrl}
                        />
                      ) : (
                        <span className="text-[10px] text-white/40">vazio</span>
                      )}
                    </div>

                    <p className="text-[10px] text-white/40">
                      {zoneCount(zone)} cartas
                    </p>
                  </div>
                ))}

                <Button
                  ref={(node) => {
                    libraryRef.current = node;
                    libraryDrop.setNodeRef(node);
                  }}
                  type="button"
                  variant="ghost"
                  className={`relative flex h-full flex-1 flex-col items-center rounded-2xl text-xs uppercase tracking-[0.2em] ${
                    activeDrag
                      ? libraryDrop.isOver
                        ? "ring-2 ring-blue-400/75 bg-blue-500/10"
                        : "ring-1 ring-blue-300/40 bg-blue-500/5"
                      : ""
                  }`}
                  onClick={handleDraw}
                  disabled={zoneCount("library") === 0}
                >
                  <Image
                    src="/magic_card_back.png"
                    alt="Pilha do deck"
                    width={150}
                    height={200}
                    className="object-cover"
                    draggable={false}
                    priority={false}
                  />
                  {libraryTop && <DeckTopCard cardId={libraryTop.id} />}
                </Button>
              </aside>
            </div>
          </section>
        </div>

        {previewCard && previewAnchor && (
          <div
            className="pointer-events-none fixed z-[500]"
            style={{
              left: previewAnchor?.x ?? 0,
              top: previewAnchor?.y ?? 0,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="origin-bottom scale-75 sm:scale-90 lg:scale-100">
              <CardPreview
                imageUrl={previewCard.imageUrl}
                name={previewCard.name}
                className="border border-white/20"
              />
            </div>
          </div>
        )}

        <TokenModal
          isOpen={isTokenModalOpen}
          onClose={() => setIsTokenModalOpen(false)}
          onConfirm={(definition, instance) => {
            dispatch({
              type: "token/create",
              playerId: localPlayerId,
              definition,
              instance,
            });
          }}
          playerId={localPlayerId}
        />

        {activeDrag && (
          <div
            className="pointer-events-none fixed inset-0 z-[150]"
            aria-hidden="true"
          />
        )}
      </div>
    </DndContext>
  );
}
