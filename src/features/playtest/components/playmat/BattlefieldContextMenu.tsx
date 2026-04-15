"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BattlefieldContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onCreateToken: () => void;
};

export function BattlefieldContextMenu({
  x,
  y,
  onClose,
  onCreateToken,
}: BattlefieldContextMenuProps) {
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const MENU_W = 180;
  const MENU_H = 60;
  const MARGIN = 8;
  const left = Math.max(MARGIN, Math.min(x, window.innerWidth - MENU_W - MARGIN));
  const top = Math.max(MARGIN, Math.min(y, window.innerHeight - MENU_H - MARGIN));

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9996] flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#0e1420]/95 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md"
      style={{ left, top, width: MENU_W }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="flex items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-white/80 transition hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
        onClick={() => {
          onCreateToken();
          onClose();
        }}
      >
        <span className="text-base leading-none text-[#91a7da]">⊕</span>
        Criar token
      </button>
    </div>,
    document.body,
  );
}
