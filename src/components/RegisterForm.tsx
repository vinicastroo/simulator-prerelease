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
    <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
      {pending ? "Criando conta..." : "Criar conta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, initialRegisterState);

  return (
    <form action={formAction} className="w-full max-w-md">
      <Card className="border-white/10 bg-card/95 shadow-2xl shadow-black/35 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-accent/80">
            Strixhaven Drafter
          </p>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              Criar conta
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Guarde seus decks em uma conta simples com nome, email e senha.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Nome de usuario</Label>
              <Input
                id="register-name"
                required
                minLength={2}
                type="text"
                name="name"
                autoComplete="nickname"
                className="h-11 rounded-xl bg-background/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className="h-11 rounded-xl bg-background/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Senha</Label>
              <Input
                id="register-password"
                required
                minLength={6}
                type="password"
                name="password"
                autoComplete="new-password"
                className="h-11 rounded-xl bg-background/40"
              />
            </div>
          </div>

          {state.error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {state.error}
            </div>
          ) : null}

          <SubmitButton />

          <Separator className="bg-white/10" />

          <p className="text-center text-sm text-muted-foreground">
            Ja tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary transition hover:text-primary/80"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
