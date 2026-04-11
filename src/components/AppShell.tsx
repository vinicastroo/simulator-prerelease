import type { ReactNode } from "react";

type Props = {
  sidebar: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, children }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-void">
      {/*
       * overflow-hidden clips to the main column so the sidebar stays fixed.
       * Children (DndCanvas) create their own scroll context via overflow-auto.
       * h-full propagates the exact available height down to the canvas.
       */}
      <main className="flex-1 overflow-hidden h-full">{children}</main>
      {sidebar}
    </div>
  );
}
