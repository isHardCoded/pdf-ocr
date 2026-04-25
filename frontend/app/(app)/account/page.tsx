import type { Metadata } from "next";

import { AccountView } from "@/features/account";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Личный кабинет — ${site.name}`,
  description: "Профиль и демо-статистика (mock).",
};

export default function AccountPage() {
  return <AccountView />;
}
