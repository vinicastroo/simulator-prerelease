"use client";

import { usePrerelease } from "@/context/PrereleaseContext";
import { CardToken } from "./CardToken";

export function Canvas() {
  const { cards } = usePrerelease();

  return (
    <div
      className="relative flex-1 overflow-hidden bg-bg-void"
      style={{ minHeight: "100vh" }}
    >
      {cards.map((placed) => (
        <CardToken key={placed.id} placed={placed} />
      ))}
    </div>
  );
}
