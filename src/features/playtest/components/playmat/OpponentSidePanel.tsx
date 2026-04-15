import Image from "next/image";
import { CardBack } from "../CardBack";
import type { CardHoverInfo } from "./types";

// ─── Types ───────────────────────────────────────────────────────────────────

type StackZoneInfo = {
  topName: string;
  topImageUrl: string | null;
  count: number;
};

type OpponentSidePanelProps = {
  graveyard: StackZoneInfo;
  exile: StackZoneInfo;
  libraryCount: number;
  onViewGraveyard?: () => void;
  onViewExile?: () => void;
  onHoverGraveyardTop?: (
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
  onHoverExileTop?: (
    info: CardHoverInfo | null,
    target: HTMLElement | null,
  ) => void;
};

// ─── Internal zone pieces ────────────────────────────────────────────────────

function ZoneShell({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col font-mono ">
      {children}
      <div className="flex w-full flex-row items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <p className="text-[10px] text-white/40">{count} cartas</p>
      </div>
    </div>
  );
}

function CardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[190px] min-w-[140px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
      {children}
    </div>
  );
}

function CardSlot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[209px] w-[150px] items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.02]">
      {children}
    </div>
  );
}

// ─── Stack zone (graveyard / exile) ──────────────────────────────────────────

function StackZone({
  label,
  topName,
  topImageUrl,
  count,
  onClick,
  onHoverTop,
}: StackZoneInfo & {
  label: string;
  onClick?: () => void;
  onHoverTop?: (info: CardHoverInfo | null, target: HTMLElement | null) => void;
}) {
  const hoverProps =
    onHoverTop && count > 0
      ? {
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
            onHoverTop(
              { name: topName, imageUrl: topImageUrl },
              e.currentTarget,
            ),
          onMouseLeave: () => onHoverTop(null, null),
        }
      : {};

  const cardContent =
    count > 0 ? (
      topImageUrl ? (
        <Image
          src={topImageUrl}
          alt={topName}
          width={150}
          height={209}
          className="h-[209px] w-[150px] rounded-[8px] border border-white/10 object-cover"
          unoptimized
          {...hoverProps}
        />
      ) : (
        <span className="text-[10px] text-white/40" {...hoverProps}>
          {topName}
        </span>
      )
    ) : (
      <span className="text-[10px] text-white/40">vazio</span>
    );

  const inner = (
    <ZoneShell label={label} count={count}>
      <CardFrame>
        <CardSlot>{cardContent}</CardSlot>
      </CardFrame>
    </ZoneShell>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer rounded-[10px] text-left transition-opacity hover:opacity-80 focus:outline-none"
      >
        {inner}
      </button>
    );
  }

  return inner;
}

// ─── Library zone (face-down, read-only) ─────────────────────────────────────

function LibraryZone({ count }: { count: number }) {
  return (
    <ZoneShell label="Grimório" count={count}>
      <CardFrame>
        <CardSlot>
          <Image
            src="/magic_card_back.png"
            alt="Grimório do oponente"
            width={150}
            height={209}
            className={`h-[209px] w-[150px] rounded-[8px] object-cover ${count === 0 ? "opacity-30" : ""}`}
            style={{ transform: "scaleY(-1)" }}
            draggable={false}
            priority={false}
          />
        </CardSlot>
      </CardFrame>
    </ZoneShell>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

/**
 * Read-only mirror of SideZonePanel for the opponent.
 * Zones displayed in reversed order (Grimório | Exílio | Cemitério)
 * so the layout is a true left-right mirror of the local player's panel.
 */
export function OpponentSidePanel({
  graveyard,
  exile,
  libraryCount,
  onViewGraveyard,
  onViewExile,
  onHoverGraveyardTop,
  onHoverExileTop,
}: OpponentSidePanelProps) {
  return (
    // Altere a tag <aside> para:
    <aside className="flex flex-row gap-3 items-start ml-auto -mt-24 pr-4">
      <LibraryZone count={libraryCount} />
      <StackZone
        label="Exílio"
        {...exile}
        onClick={onViewExile}
        onHoverTop={onHoverExileTop}
      />
      <StackZone
        label="Cemitério"
        {...graveyard}
        onClick={onViewGraveyard}
        onHoverTop={onHoverGraveyardTop}
      />
    </aside>
  );
}
