"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useMemo, useState } from "react";
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
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <Card className="overflow-hidden rounded-[2rem] border border-white/12 bg-[#11131a]/92 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="h-1 w-full bg-[linear-gradient(90deg,#4d6393_0%,#90a4da_50%,#4d6393_100%)]" />
        <CardHeader className="space-y-4 px-8 pt-8 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#91a7da]">
            Strixhaven Drafter
          </p>
          <div className="space-y-3">
            <CardTitle className="text-4xl font-black tracking-[-0.05em] text-white">
              Entrar
            </CardTitle>
            <CardDescription className="max-w-sm text-sm leading-7 text-white/48">
              Acesse sua conta para ver e continuar seus decks.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-7 px-8 pb-8">
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label
                htmlFor="login-email"
                className="text-[11px] uppercase tracking-[0.24em] text-white/55"
              >
                Email
              </Label>
              <Input
                id="login-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className="h-12 rounded-2xl border-white/10 bg-black/20 px-4 text-white placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="login-password"
                className="text-[11px] uppercase tracking-[0.24em] text-white/55"
              >
                Senha
              </Label>
              <Input
                id="login-password"
                required
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-12 rounded-2xl border-white/10 bg-black/20 px-4 text-white placeholder:text-white/20"
              />
            </div>
          </div>

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-2xl bg-[#4d6393] text-white shadow-[0_12px_30px_rgba(77,99,147,0.28)] hover:bg-[#5f77ab]"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </Button>

          <Separator className="bg-white/10" />

          <p className="text-center text-sm text-white/42">
            Ainda nao tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#9ab1e6] transition hover:text-white"
            >
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
