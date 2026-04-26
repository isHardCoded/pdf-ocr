"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { registerAccount, verifyEmail } from "@/lib/auth-api";
import { validateEmail, validateFullName, validatePassword } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

export function RegisterView() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [mockCode, setMockCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  function validateForm(): boolean {
    const e: Record<string, string> = {};
    const fn = validateFullName(fullName);
    if (fn) e.fullName = fn;
    const em = validateEmail(email);
    if (em) e.email = em;
    const pw = validatePassword(password);
    if (pw) e.password = pw;
    if (password !== passwordConfirmation) e.passwordConfirmation = "Пароли не совпадают";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await registerAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        passwordConfirmation,
      });
      setPendingEmail(res.email);
      setMockCode(res.mockEmailCode);
      setCodeInput("");
      setVerifyOpen(true);
      toast.success("Аккаунт создан. Подтвердите почту.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось зарегистрироваться";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    const digits = codeInput.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) {
      toast.error("Введите 6 цифр кода");
      return;
    }
    setVerifying(true);
    try {
      await verifyEmail({ email: pendingEmail, code: digits });
      setVerifyOpen(false);
      toast.success("Почта подтверждена. Теперь можно войти.");
      router.push(`/login?email=${encodeURIComponent(pendingEmail)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Неверный код";
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-md">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Регистрация</CardTitle>
            <CardDescription>
              Уже есть аккаунт?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Войти
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onRegister} noValidate>
              <div className="space-y-2">
                <Label htmlFor="reg-name">Имя (только русские буквы)</Label>
                <input
                  id="reg-name"
                  name="fullName"
                  autoComplete="name"
                  value={fullName}
                  onChange={(ev) => setFullName(ev.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={fieldErrors.fullName ? "reg-name-err" : undefined}
                />
                {fieldErrors.fullName ? (
                  <p id="reg-name-err" className="text-xs text-destructive">
                    {fieldErrors.fullName}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Электронная почта</Label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Пароль</Label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                {fieldErrors.password ? (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Минимум 8 символов: латинская заглавная буква, цифра и спецсимвол.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password2">Подтверждение пароля</Label>
                <input
                  id="reg-password2"
                  name="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(ev) => setPasswordConfirmation(ev.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                />
                {fieldErrors.passwordConfirmation ? (
                  <p className="text-xs text-destructive">{fieldErrors.passwordConfirmation}</p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Отправка…" : "Зарегистрироваться"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {verifyOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-title"
        >
          <Card className="w-full max-w-md border-border shadow-lg">
            <CardHeader>
              <CardTitle id="verify-title">Подтверждение почты</CardTitle>
              <CardDescription>
                Мок: письмо не отправляется. Код, который пришёл бы на <span className="font-medium">{pendingEmail}</span>:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-center font-mono text-2xl font-semibold tracking-[0.35em] text-primary"
                aria-live="polite"
              >
                {mockCode}
              </div>
              <form className="space-y-3" onSubmit={onVerify}>
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Введите код из письма</Label>
                  <input
                    id="verify-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={codeInput}
                    onChange={(ev) => setCodeInput(ev.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                    placeholder="000000"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setVerifyOpen(false)} disabled={verifying}>
                    Позже
                  </Button>
                  <Button type="submit" disabled={verifying}>
                    {verifying ? "Проверка…" : "Подтвердить"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
