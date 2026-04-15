import type { ZoneName } from "@/lib/game/types";

export type LibraryDropTarget = "library-top" | "library-bottom";

export type DropTargetId = ZoneName | LibraryDropTarget;

export type DragCardData = {
  cardId: string;
  from: ZoneName;
  behavior?: "draw-from-library" | "move-from-library" | "move-from-zone-modal";
};

export type ActiveDragState = DragCardData & {
  cardIds: string[];
  over: DropTargetId | null;
  origin: ZoneName;
};

export type CardHoverInfo = {
  name: string;
  imageUrl: string | null;
};

export type PreviewAnchor = {
  x: number;
  y: number;
};
