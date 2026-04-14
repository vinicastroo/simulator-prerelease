"use client";

import { useEffect, useRef } from "react";
import type { ActionLogEntry } from "@/lib/game/types";

type ActionLogSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  entries: ActionLogEntry[];
};

export function ActionLogSidebar({
  isOpen,
  onClose,
  entries,
}: ActionLogSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when entries change or sidebar opens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-[60] w-80 border-l border-white/8 bg-black/90 shadow-2xl backdrop-blur-xl transition-transform animate-in slide-in-from-right duration-300">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/8 p-4">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/90">
              Histórico de Ações
            </h3>
            <p className="mt-1 text-[10px] text-white/40">
              Rastro completo da partida
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        >
          {entries.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/20">
                Sem ações registradas
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="group rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-blue-400/80">
                    {entry.actionType
                      .replace("game/", "")
                      .replace("card/", "")
                      .replace("player/", "")}
                  </span>
                  <span className="text-[9px] text-white/20 font-mono">
                    {new Date(entry.at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                  {entry.description}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/8 p-4 bg-white/[0.01]">
          <p className="text-[9px] uppercase tracking-wider text-white/20 text-center">
            {entries.length} ações no total
          </p>
        </div>
      </div>
    </div>
  );
}
