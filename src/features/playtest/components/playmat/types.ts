import type { ZoneName } from "@/lib/game/types";

export type LibraryDropTarget = "library-top" | "library-bottom";

export type DropTargetId = ZoneName | LibraryDropTarget;

export type DragCardData = {
  cardId: string;
  from: ZoneName;
};

export type ActiveDragState = DragCardData & {
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
