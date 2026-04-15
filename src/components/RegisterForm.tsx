"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialRegisterState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 h-11 w-full rounded-xl bg-white font-bold text-[#06070a] shadow-[0_0_24px_rgba(255,255,255,0.12)] transition hover:bg-white/90 disabled:opacity-50"
    >
      {pending ? "Criando conta..." : "Criar conta"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, initialRegisterState);

  return (
    <form action={formAction} className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#4d6393]/10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="px-8 pb-8 pt-8">
          {/* Brand */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
              Strixhaven Drafter
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Criar conta
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Guarde seus decks em uma conta simples com nome, email e senha.
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="register-name"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40"
              >
                Nome de usuário
              </Label>
              <Input
                id="register-name"
                required
                minLength={2}
                type="text"
                name="name"
                autoComplete="nickname"
                className="h-11 rounded-xl border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/20 focus-visible:border-white/25 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-email"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40"
              >
                Email
              </Label>
              <Input
                id="register-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className="h-11 rounded-xl border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/20 focus-visible:border-white/25 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-password"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40"
              >
                Senha
              </Label>
              <Input
                id="register-password"
                required
                minLength={6}
                type="password"
                name="password"
                autoComplete="new-password"
                className="h-11 rounded-xl border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/20 focus-visible:border-white/25 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Feedback */}
          {state.error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <SubmitButton />

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white/30">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-white/70 transition hover:text-white"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
