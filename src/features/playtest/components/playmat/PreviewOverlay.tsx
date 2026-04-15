"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CardPreview } from "../CardPreview";
import type { CardHoverInfo, PreviewAnchor } from "./types";

const PREVIEW_WIDTH = 340;
const PREVIEW_HEIGHT = 475;
const PREVIEW_MARGIN = 16;
const PREVIEW_GAP = 2;

function getPreviewScale(viewportWidth: number) {
  if (viewportWidth >= 1024) return 0.85;
  if (viewportWidth >= 640) return 0.72;
  return 0.6;
}

type PreviewOverlayProps = {
  previewCard: CardHoverInfo | null;
  previewAnchor: PreviewAnchor | null;
  preferBelow?: boolean;
};

export function PreviewOverlay({
  previewCard,
  previewAnchor,
  preferBelow = false,
}: PreviewOverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!previewCard || !previewAnchor || !mounted) return null;

  const viewportWidth =
    typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? 720 : window.innerHeight;
  const scale = getPreviewScale(viewportWidth);
  const previewWidth = PREVIEW_WIDTH * scale;
  const previewHeight = PREVIEW_HEIGHT * scale;
  const verticalOffset = Math.min(24, previewWidth * 0.06);
  const availableAbove = previewAnchor.y - PREVIEW_MARGIN;
  const availableBelow = viewportHeight - previewAnchor.y - PREVIEW_MARGIN;
  const availableRight = viewportWidth - previewAnchor.x - PREVIEW_MARGIN;
  const availableLeft = previewAnchor.x - PREVIEW_MARGIN;

  let left = previewAnchor.x - verticalOffset;
  let top = preferBelow
    ? previewAnchor.y + PREVIEW_GAP
    : previewAnchor.y - previewHeight - PREVIEW_GAP;

  if (preferBelow) {
    if (availableBelow >= previewHeight) {
      left = previewAnchor.x - verticalOffset;
      top = previewAnchor.y + PREVIEW_GAP;
    } else if (availableRight >= previewWidth) {
      left = previewAnchor.x + PREVIEW_GAP;
      top = previewAnchor.y - previewHeight / 2;
    } else if (availableLeft >= previewWidth) {
      left = previewAnchor.x - previewWidth - PREVIEW_GAP;
      top = previewAnchor.y - previewHeight / 2;
    } else {
      left = previewAnchor.x - verticalOffset;
      top = previewAnchor.y - previewHeight - PREVIEW_GAP;
    }
  } else if (availableAbove >= previewHeight) {
    left = previewAnchor.x - verticalOffset;
    top = previewAnchor.y - previewHeight - PREVIEW_GAP;
  } else if (availableRight >= previewWidth) {
    left = previewAnchor.x + PREVIEW_GAP;
    top = previewAnchor.y - previewHeight / 2;
  } else if (availableLeft >= previewWidth) {
    left = previewAnchor.x - previewWidth - PREVIEW_GAP;
    top = previewAnchor.y - previewHeight / 2;
  } else if (availableBelow >= previewHeight) {
    left = previewAnchor.x - verticalOffset;
    top = previewAnchor.y + PREVIEW_GAP;
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
          className="border border-white/20"
        />
      </div>
    </div>,
    document.body,
  );
}
