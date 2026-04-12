"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerUser } from "@/actions/auth";

const initialRegisterState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-2xl bg-gold-accent px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Criando conta..." : "Criar conta"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, initialRegisterState);

  return (
    <form
      action={formAction}
      className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#10131b]/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    >
      <div className="mb-8 space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-accent/70">
          Strixhaven Drafter
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Criar conta
        </h1>
        <p className="text-sm text-white/45">
          Guarde seus decks em uma conta simples com nome, email e senha.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2 text-sm text-white/75">
          <span>Nome de usuario</span>
          <input
            required
            minLength={2}
            type="text"
            name="name"
            autoComplete="nickname"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-gold-accent/50 focus:bg-black/30"
          />
        </label>

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
            minLength={6}
            type="password"
            name="password"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-gold-accent/50 focus:bg-black/30"
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="mt-6 text-center text-sm text-white/45">
        Ja tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-gold-accent transition hover:text-gold-accent/80"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
