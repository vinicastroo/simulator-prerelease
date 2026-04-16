"use client";

import { useEffect } from "react";

export default function PlaytestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/playtest error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#08090d] p-8 text-white">
      <p className="font-mono text-xs uppercase tracking-widest text-white/40">
        Erro
      </p>
      <p className="text-lg font-bold text-white">{error.message}</p>
      {error.digest && (
        <p className="font-mono text-xs text-white/30">
          digest: {error.digest}
        </p>
      )}
      <pre className="mt-2 w-full max-w-xl overflow-auto whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-xs text-red-300">
        {error.stack}
      </pre>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 hover:bg-white/5"
      >
        Tentar novamente
      </button>
    </div>
  );
}
