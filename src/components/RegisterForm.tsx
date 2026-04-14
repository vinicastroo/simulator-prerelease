"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const initialRegisterState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-2xl bg-[#4d6393] text-white shadow-[0_12px_30px_rgba(77,99,147,0.28)] hover:bg-[#5f77ab]"
    >
      {pending ? "Criando conta..." : "Criar conta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, initialRegisterState);

  return (
    <form action={formAction} className="w-full max-w-md">
      <Card className="overflow-hidden rounded-[2rem] border border-white/12 bg-[#11131a]/92 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="h-1 w-full bg-[linear-gradient(90deg,#4d6393_0%,#90a4da_50%,#4d6393_100%)]" />
        <CardHeader className="space-y-4 px-8 pt-8 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#91a7da]">
            Strixhaven Drafter
          </p>
          <div className="space-y-3">
            <CardTitle className="text-4xl font-black tracking-[-0.05em] text-white">
              Criar conta
            </CardTitle>
            <CardDescription className="max-w-sm text-sm leading-7 text-white/48">
              Guarde seus decks em uma conta simples com nome, email e senha.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-7 px-8 pb-8">
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label
                htmlFor="register-name"
                className="text-[11px] uppercase tracking-[0.24em] text-white/55"
              >
                Nome de usuario
              </Label>
              <Input
                id="register-name"
                required
                minLength={2}
                type="text"
                name="name"
                autoComplete="nickname"
                className="h-12 rounded-2xl border-white/10 bg-black/20 px-4 text-white placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="register-email"
                className="text-[11px] uppercase tracking-[0.24em] text-white/55"
              >
                Email
              </Label>
              <Input
                id="register-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className="h-12 rounded-2xl border-white/10 bg-black/20 px-4 text-white placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="register-password"
                className="text-[11px] uppercase tracking-[0.24em] text-white/55"
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
                className="h-12 rounded-2xl border-white/10 bg-black/20 px-4 text-white placeholder:text-white/20"
              />
            </div>
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {state.error}
            </div>
          ) : null}

          <SubmitButton />

          <Separator className="bg-white/10" />

          <p className="text-center text-sm text-white/42">
            Ja tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#9ab1e6] transition hover:text-white"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
