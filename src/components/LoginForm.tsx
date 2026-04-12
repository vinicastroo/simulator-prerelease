"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useMemo, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const successMessage = useMemo(() => {
    if (searchParams.get("registered") === "1") {
      return "Conta criada com sucesso. Entre para acessar seus decks.";
    }

    return null;
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/decks",
    });

    setIsPending(false);

    if (!result || result.error) {
      setError("Email ou senha invalidos.");
      return;
    }

    router.push(result.url ?? "/decks");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#10131b]/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    >
      <div className="mb-8 space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-accent/70">
          Strixhaven Drafter
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Entrar
        </h1>
        <p className="text-sm text-white/45">
          Acesse sua conta para ver e continuar seus decks.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2 text-sm text-white/75">
          <span>Email</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-gold-accent/50 focus:bg-black/30"
          />
        </label>

        <label className="block space-y-2 text-sm text-white/75">
          <span>Senha</span>
          <input
            required
            type="password"
            name="password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-gold-accent/50 focus:bg-black/30"
          />
        </label>
      </div>

      {successMessage ? (
        <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-2xl bg-gold-accent px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="mt-6 text-center text-sm text-white/45">
        Ainda nao tem conta?{" "}
        <Link
          href="/register"
          className="font-semibold text-gold-accent transition hover:text-gold-accent/80"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
