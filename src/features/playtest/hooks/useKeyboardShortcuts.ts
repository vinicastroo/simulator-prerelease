"use client";

import { useEffect } from "react";

type ShortcutHandlers = {
  onTap?: () => void;
  onDraw?: () => void;

  onShuffle?: () => void;
  onAdvancePhase?: () => void;
  onRetreatPhase?: () => void;
  onToggleArrowMode?: () => void;
  onCancelArrowMode?: () => void;
  disabled?: boolean;
};

function isInputTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (handlers.disabled || isInputTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (e.ctrlKey || e.metaKey) return;

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (e.ctrlKey) {
            handlers.onRetreatPhase?.();
          } else {
            handlers.onAdvancePhase?.();
          }
          break;
        case "t":
          handlers.onTap?.();
          break;
        case "d":
          handlers.onDraw?.();
          break;

        case "s":
          handlers.onShuffle?.();
          break;
        case " ":
          e.preventDefault();
          handlers.onAdvancePhase?.();
          break;
        case "w":
          if (e.repeat) break;
          handlers.onToggleArrowMode?.();
          break;
        case "Escape":
          if (e.repeat) break;
          handlers.onCancelArrowMode?.();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
