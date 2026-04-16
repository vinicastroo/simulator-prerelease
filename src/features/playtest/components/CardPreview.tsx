"use client";

import Image from "next/image";

type CardPreviewProps = {
  imageUrl: string | null;
  name: string;
  power?: string | null;
  toughness?: string | null;
  cardType?: string;
  className?: string;
};

export const PREVIEW_WIDTH = 340;
export const PREVIEW_IMAGE_HEIGHT = 475;
export const PREVIEW_STATS_HEIGHT = 36;
export const PREVIEW_STATS_GAP = 10;

export function isCreaturePreview({
  power,
  toughness,
  cardType,
}: {
  power?: string | null;
  toughness?: string | null;
  cardType?: string;
}) {
  return (
    power != null &&
    toughness != null &&
    cardType?.toLowerCase().includes("creature")
  );
}

export function getCardPreviewHeight(props: {
  power?: string | null;
  toughness?: string | null;
  cardType?: string;
}) {
  return isCreaturePreview(props)
    ? PREVIEW_IMAGE_HEIGHT + PREVIEW_STATS_GAP + PREVIEW_STATS_HEIGHT
    : PREVIEW_IMAGE_HEIGHT;
}

export function CardPreview({
  imageUrl,
  name,
  power,
  toughness,
  cardType,
  className = "",
}: CardPreviewProps) {
  const isCreature = isCreaturePreview({ power, toughness, cardType });

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 text-sm p-4 text-center ${className}`}
        style={{ minWidth: PREVIEW_WIDTH, minHeight: PREVIEW_IMAGE_HEIGHT }}
      >
        {name}
      </div>
    );
  }

  return (
    <div className={`flex flex-col rounded-lg ${className}`}>
      <div className="overflow-hidden rounded-lg shadow-2xl">
        <Image
          src={imageUrl}
          alt={name}
          width={PREVIEW_WIDTH}
          height={PREVIEW_IMAGE_HEIGHT}
          className="object-cover"
          unoptimized
        />
      </div>

      {isCreature && (
        <div className="mt-[10px] flex justify-end">
          <div className="flex items-center gap-[3px]" style={{ opacity: 0.9 }}>
            <div
              className="flex items-center justify-center font-black text-black"
              style={{
                width: 44,
                height: PREVIEW_STATS_HEIGHT,
                fontSize: 22,
                lineHeight: 1,
                background:
                  "radial-gradient(ellipse at 40% 40%, #e8dfc0 0%, #c9b97a 55%, #a08840 100%)",
                borderRadius: "4px 4px 6px 6px",
                boxShadow:
                  "0 0 0 1.5px #7a6230, inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.25)",
                textShadow: "0 1px 1px rgba(255,255,255,0.3)",
              }}
            >
              {power}
            </div>

            <span
              className="select-none font-black text-[#b89b58]"
              style={{ fontSize: 20, lineHeight: 1 }}
            >
              /
            </span>

            <div
              className="flex items-center justify-center font-black text-black"
              style={{
                width: 44,
                height: PREVIEW_STATS_HEIGHT,
                fontSize: 22,
                lineHeight: 1,
                background:
                  "radial-gradient(ellipse at 40% 40%, #e8dfc0 0%, #c9b97a 55%, #a08840 100%)",
                borderRadius: "4px 4px 6px 6px",
                boxShadow:
                  "0 0 0 1.5px #7a6230, inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.25)",
                textShadow: "0 1px 1px rgba(255,255,255,0.3)",
              }}
            >
              {toughness}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
