import type { Metadata } from "next";

import { RegisterView } from "@/features/auth";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Регистрация — ${site.name}`,
  description: "Создание аккаунта PDF OCR",
};

export default function RegisterPage() {
  return <RegisterView />;
}
