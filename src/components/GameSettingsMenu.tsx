"use client";

import { RotateCcw, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MultiplayerResetStatus = {
  open: boolean;
  currentPlayerAccepted: boolean;
  opponentAccepted: boolean;
  currentPlayerLabel: string;
  opponentLabel: string;
  pending: boolean;
  onCancel?: () => void | Promise<void>;
};

type GameSettingsMenuProps = {
  onReset: () => void | Promise<void>;
  multiplayerReset?: MultiplayerResetStatus;
};

export function GameSettingsMenu({
  onReset,
  multiplayerReset,
}: GameSettingsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSeenResetVote, setHasSeenResetVote] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previousResetOpenRef = useRef(Boolean(multiplayerReset?.open));

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen]);

  useEffect(() => {
    const isOpen = Boolean(multiplayerReset?.open);

    if (!previousResetOpenRef.current && isOpen) {
      // Vote just opened (opponent initiated) — show dialog
      setHasSeenResetVote(true);
    } else if (!isOpen) {
      // Vote closed (reset completed or cancelled) — reset guard
      setHasSeenResetVote(false);
    }

    previousResetOpenRef.current = isOpen;
  }, [multiplayerReset?.open]);

  const handleReset = async () => {
    setIsMenuOpen(false);
    setIsSubmitting(true);
    setHasSeenResetVote(true);

    try {
      await onReset();
    } catch {
      setHasSeenResetVote(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[260]" ref={menuRef}>
        <div className="relative">
          {isMenuOpen ? (
            <div className="absolute bottom-full left-0 mb-2 min-w-48 rounded-2xl border border-white/10 bg-[#0d1017]/95 p-2 shadow-[0_18px_42px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/78 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleReset()}
                disabled={
                  isSubmitting ||
                  multiplayerReset?.pending ||
                  multiplayerReset?.currentPlayerAccepted
                }
              >
                <RotateCcw className="size-4" />
                <span>Resetar game</span>
              </button>
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full border border-white/10 bg-black/45 text-white/75 shadow-lg backdrop-blur-md hover:bg-white/10 hover:text-white"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Abrir configuracoes da partida"
          >
            <Settings2 className="size-4" />
          </Button>
        </div>
      </div>

      {multiplayerReset ? (
        <Dialog open={hasSeenResetVote && multiplayerReset.open}>
          <DialogContent
            className="border-white/10 bg-[#101317] text-white sm:max-w-md"
            showCloseButton={false}
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-[-0.03em] text-white">
                Resetar partida
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/55">
                Os dois jogadores precisam aceitar para reiniciar a partida do
                zero.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <ResetVoteRow
                label={multiplayerReset.currentPlayerLabel}
                accepted={multiplayerReset.currentPlayerAccepted}
              />
              <ResetVoteRow
                label={multiplayerReset.opponentLabel}
                accepted={multiplayerReset.opponentAccepted}
              />
            </div>

            <DialogFooter className="flex gap-2 border-white/10 bg-white/[0.02]">
              {multiplayerReset.onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-white/60 hover:bg-white/8 hover:text-white"
                  onClick={() => {
                    setHasSeenResetVote(false);
                    void multiplayerReset.onCancel?.();
                  }}
                  disabled={isSubmitting || multiplayerReset.pending}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="button"
                className="bg-[#4d6393] text-white hover:bg-[#5f77ab]"
                onClick={() => void handleReset()}
                disabled={
                  isSubmitting ||
                  multiplayerReset.pending ||
                  multiplayerReset.currentPlayerAccepted
                }
              >
                {multiplayerReset.currentPlayerAccepted
                  ? "Aguardando oponente"
                  : "Aceitar reset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

function ResetVoteRow({
  label,
  accepted,
}: {
  label: string;
  accepted: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-white/80">{label}</span>
      <span
        className={
          accepted
            ? "text-xs font-semibold text-emerald-300"
            : "text-xs font-semibold text-white/45"
        }
      >
        {accepted ? "Aceitou" : "Pendente"}
      </span>
    </div>
  );
}
