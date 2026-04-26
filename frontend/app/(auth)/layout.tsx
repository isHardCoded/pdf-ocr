import type { ReactNode } from "react";

/** Вход и регистрация: без шапки, форма по центру вьюпорта */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">{children}</div>
  );
}
