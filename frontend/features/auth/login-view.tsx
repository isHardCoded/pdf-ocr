"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth-api";
import { validateEmail } from "@/lib/auth-validation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function LoginView() {
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = sp.get("email");
    if (q) setEmail(q);
  }, [sp]);

  useEffect(() => {
    if (status === "authed") {
      router.replace("/account");
    }
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const em = validateEmail(email);
    setEmailErr(em);
    if (em) return;
    if (!password) {
      toast.error("Введите пароль");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      await refresh();
      toast.success("Вы вошли в аккаунт");
      router.push("/account");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось войти";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Вход</CardTitle>
          <CardDescription>
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Регистрация
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email">Электронная почта</Label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              />
              {emailErr ? <p className="text-xs text-destructive">{emailErr}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Пароль</Label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || status === "loading"}>
              {submitting ? "Вход…" : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
