import type { CardInstance } from "@/lib/game/types";
import { HandCard } from "./HandCard";
import type { CardHoverInfo } from "./types";

type HandDisplayCard = {
  card: CardInstance;
  name: string;
  imageUrl: string | null;
  manaCost: string;
};

type HandZoneProps = {
  setRefs: (node: HTMLDivElement | null) => void;
  isActiveDropTarget: boolean;
  isAnyDragActive: boolean;
  hiddenCardId: string | null;
  handCards: HandDisplayCard[];
  onHoverCard: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
};

export function HandZone({
  setRefs,
  isActiveDropTarget,
  isAnyDragActive,
  hiddenCardId,
  handCards,
  onHoverCard,
}: HandZoneProps) {
  return (
    <div
      ref={setRefs}
      className={`relative flex flex-1 h-full items-center justify-center rounded-2xl p-4 -mb-12 ${
        isAnyDragActive
          ? isActiveDropTarget
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
          isAnyDragActive={isAnyDragActive}
          isHidden={card.id === hiddenCardId}
          onHover={onHoverCard}
        />
      ))}

      {handCards.length === 0 && (
        <div className="flex items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
          Mão vazia
        </div>
      )}
    </div>
  );
}
