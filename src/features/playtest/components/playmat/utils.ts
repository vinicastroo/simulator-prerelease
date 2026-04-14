import type { DragEndEvent } from "@dnd-kit/core";
import type { ZoneName } from "@/lib/game/types";
import { GRID_SIZE } from "./constants";

export function getClientPositionFromEvent(event: Event | null | undefined) {
  if (!event) return null;

  if (event instanceof MouseEvent || event instanceof PointerEvent) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  if (event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return null;

    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
    };
  }

  return null;
}

export function parseManaCost(cost: string) {
  if (!cost) return [];
  const matches = cost.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((token) =>
    token.replace(/[{}]/g, "").replaceAll("/", "").toUpperCase(),
  );
}

export function getDropClientPosition(event: DragEndEvent) {
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

export function snapToGrid(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function isZoneName(value: string): value is ZoneName {
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
