"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { PreviewOverlay } from "./PreviewOverlay";
import type { CardHoverInfo, PreviewAnchor } from "./types";

export type HoverPreviewHandle = {
  show: (info: CardHoverInfo, target: HTMLElement) => void;
  clear: () => void;
};

type HoverPreviewHostProps = {
  gap?: number;
};

export const HoverPreviewHost = memo(
  forwardRef<HoverPreviewHandle, HoverPreviewHostProps>(
    function HoverPreviewHost({ gap }, ref) {
      const [previewCard, setPreviewCard] = useState<CardHoverInfo | null>(
        null,
      );
      const [previewAnchor, setPreviewAnchor] = useState<PreviewAnchor | null>(
        null,
      );

      const clear = useCallback(() => {
        setPreviewCard(null);
        setPreviewAnchor(null);
      }, []);

      const show = useCallback((info: CardHoverInfo, target: HTMLElement) => {
        const rect = target.getBoundingClientRect();
        setPreviewCard(info);
        setPreviewAnchor({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height * 0.5,
        });
      }, []);

      useImperativeHandle(
        ref,
        () => ({
          show,
          clear,
        }),
        [clear, show],
      );

      return (
        <PreviewOverlay
          previewCard={previewCard}
          previewAnchor={previewAnchor}
          gap={gap}
        />
      );
    },
  ),
);
