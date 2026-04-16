"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CardPreview,
  getCardPreviewHeight,
  PREVIEW_WIDTH,
} from "../CardPreview";
import type { CardHoverInfo, PreviewAnchor } from "./types";

const PREVIEW_MARGIN = 16;
const DEFAULT_PREVIEW_GAP = 16;

function getPreviewScale(viewportWidth: number) {
  if (viewportWidth >= 1024) return 0.85;
  if (viewportWidth >= 640) return 0.72;
  return 0.6;
}

type PreviewOverlayProps = {
  previewCard: CardHoverInfo | null;
  previewAnchor: PreviewAnchor | null;
  preferBelow?: boolean;
  gap?: number;
};

export const PreviewOverlay = memo(function PreviewOverlay({
  previewCard,
  previewAnchor,
  preferBelow = false,
  gap = DEFAULT_PREVIEW_GAP,
}: PreviewOverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { left, top, previewWidth, previewHeight, scale } = useMemo(() => {
    if (!previewAnchor) {
      return {
        left: 0,
        top: 0,
        previewWidth: 0,
        previewHeight: 0,
        scale: 1,
      };
    }

    const viewportWidth =
      typeof window === "undefined" ? 1280 : window.innerWidth;
    const viewportHeight =
      typeof window === "undefined" ? 720 : window.innerHeight;
    const previewHeightBase = getCardPreviewHeight(previewCard ?? {});
    const scale = getPreviewScale(viewportWidth);
    const previewWidth = PREVIEW_WIDTH * scale;
    const previewHeight = previewHeightBase * scale;
    const verticalOffset = Math.min(24, previewWidth * 0.06);
    const availableAbove = previewAnchor.y - PREVIEW_MARGIN;
    const availableBelow = viewportHeight - previewAnchor.y - PREVIEW_MARGIN;
    const availableRight = viewportWidth - previewAnchor.x - PREVIEW_MARGIN;
    const availableLeft = previewAnchor.x - PREVIEW_MARGIN;

    let left = previewAnchor.x - verticalOffset;
    let top = preferBelow
      ? previewAnchor.y + gap
      : previewAnchor.y - previewHeight - gap;

    if (preferBelow) {
      if (availableBelow >= previewHeight) {
        left = previewAnchor.x - verticalOffset;
        top = previewAnchor.y + gap;
      } else if (availableRight >= previewWidth) {
        left = previewAnchor.x + gap;
        top = previewAnchor.y - previewHeight / 2;
      } else if (availableLeft >= previewWidth) {
        left = previewAnchor.x - previewWidth - gap;
        top = previewAnchor.y - previewHeight / 2;
      } else {
        left = previewAnchor.x - verticalOffset;
        top = previewAnchor.y - previewHeight - gap;
      }
    } else if (availableAbove >= previewHeight) {
      left = previewAnchor.x - verticalOffset;
      top = previewAnchor.y - previewHeight - gap;
    } else if (availableRight >= previewWidth) {
      left = previewAnchor.x + gap;
      top = previewAnchor.y - previewHeight / 2;
    } else if (availableLeft >= previewWidth) {
      left = previewAnchor.x - previewWidth - gap;
      top = previewAnchor.y - previewHeight / 2;
    } else if (availableBelow >= previewHeight) {
      left = previewAnchor.x - verticalOffset;
      top = previewAnchor.y + gap;
    } else {
      top = Math.max(
        PREVIEW_MARGIN,
        Math.min(
          previewAnchor.y - previewHeight / 2,
          viewportHeight - previewHeight - PREVIEW_MARGIN,
        ),
      );
    }

    left = Math.max(
      PREVIEW_MARGIN,
      Math.min(left, viewportWidth - previewWidth - PREVIEW_MARGIN),
    );
    top = Math.max(
      PREVIEW_MARGIN,
      Math.min(top, viewportHeight - previewHeight - PREVIEW_MARGIN),
    );

    return { left, top, previewWidth, previewHeight, scale };
  }, [gap, preferBelow, previewAnchor, previewCard]);

  if (!previewCard || !previewAnchor || !mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left,
        top,
        width: previewWidth,
        height: previewHeight,
      }}
    >
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <CardPreview
          imageUrl={previewCard.imageUrl}
          name={previewCard.name}
          power={previewCard.power}
          toughness={previewCard.toughness}
          cardType={previewCard.cardType}
          className="border border-white/20"
        />
      </div>
    </div>,
    document.body,
  );
});
