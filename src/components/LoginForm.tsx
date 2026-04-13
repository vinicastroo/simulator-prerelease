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
      <Card className="border-white/10 bg-card/95 shadow-2xl shadow-black/35 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-accent/80">
            Strixhaven Drafter
          </p>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              Entrar
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Acesse sua conta para ver e continuar seus decks.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className="h-11 rounded-xl bg-background/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                required
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-11 rounded-xl bg-background/40"
              />
            </div>
          </div>

          {successMessage ? (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-xl bg-primary text-primary-foreground"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </Button>

          <Separator className="bg-white/10" />

          <p className="text-center text-sm text-muted-foreground">
            Ainda nao tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary transition hover:text-primary/80"
            >
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
