"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setError("Email ou senha inválidos.");
      return;
    }

    router.push(result.url ?? "/decks");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-500/20 bg-blue-950/20 shadow-[0_24px_80px_rgba(30,64,175,0.18)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/[0.07] via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

        <div className="relative px-8 pb-8 pt-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-[-0.05em] text-white">
              Entrar
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Acesse sua conta para ver e continuar seus decks.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="login-email"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40"
              >
                Email
              </Label>
              <Input
                id="login-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/20 transition focus-visible:border-blue-500/60 focus-visible:bg-blue-950/30 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="login-password"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40"
              >
                Senha
              </Label>
              <Input
                id="login-password"
                required
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/20 transition focus-visible:border-blue-500/60 focus-visible:bg-blue-950/30 focus-visible:ring-0"
              />
            </div>
          </div>

          {successMessage && (
            <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 h-11 w-full rounded-xl bg-white font-bold text-[#06070a] shadow-[0_0_24px_rgba(255,255,255,0.12)] transition hover:bg-white/90 disabled:opacity-50"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>

          <p className="mt-6 text-center text-sm text-white/30">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
