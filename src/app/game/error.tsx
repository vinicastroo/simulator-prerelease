"use client";

import { useEffect } from "react";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/game error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Erro</p>
      <p className="text-white font-bold text-lg">{error.message}</p>
      {error.digest && (
        <p className="text-white/30 text-xs font-mono">digest: {error.digest}</p>
      )}
      <pre className="mt-2 max-w-xl w-full overflow-auto rounded-xl bg-white/5 p-4 text-xs text-red-300 whitespace-pre-wrap">
        {error.stack}
      </pre>
      <button
        onClick={reset}
        className="mt-4 rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 hover:bg-white/5"
      >
        Tentar novamente
      </button>
    </div>
  );
}
