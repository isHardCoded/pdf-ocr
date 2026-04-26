import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginView } from "@/features/auth";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Вход — ${site.name}`,
  description: "Вход в аккаунт PDF OCR",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
