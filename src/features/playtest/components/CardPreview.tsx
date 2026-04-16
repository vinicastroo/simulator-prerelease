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

const PREVIEW_WIDTH = 340;
const PREVIEW_HEIGHT = 475;

export function CardPreview({
  imageUrl,
  name,
  power,
  toughness,
  cardType,
  className = "",
}: CardPreviewProps) {
  const isCreature =
    power != null &&
    toughness != null &&
    cardType?.toLowerCase().includes("creature");

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 text-sm p-4 text-center ${className}`}
        style={{ minWidth: PREVIEW_WIDTH, minHeight: PREVIEW_HEIGHT }}
      >
        {name}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-2xl ${className}`}
    >
      <Image
        src={imageUrl}
        alt={name}
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        className="object-cover"
        unoptimized
      />

      {isCreature && (
        <div className="absolute bottom-[4.5%] right-[5%] flex items-center gap-[3px]">
          {/* Power box */}
          <div
            className="flex items-center justify-center font-black text-black"
            style={{
              width: 44,
              height: 36,
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

          {/* Slash divider */}
          <span
            className="font-black text-[#5a4010] select-none"
            style={{ fontSize: 20, lineHeight: 1, textShadow: "0 1px 0 rgba(255,255,255,0.2)" }}
          >
            /
          </span>

          {/* Toughness box */}
          <div
            className="flex items-center justify-center font-black text-black"
            style={{
              width: 44,
              height: 36,
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
      )}
    </div>
  );
}
