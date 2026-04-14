"use client";

import Image from "next/image";

type CardPreviewProps = {
  imageUrl: string | null;
  name: string;
  className?: string;
};

const PREVIEW_WIDTH = 340;
const PREVIEW_HEIGHT = 475;

export function CardPreview({
  imageUrl,
  name,
  className = "",
}: CardPreviewProps) {
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
    </div>
  );
}
