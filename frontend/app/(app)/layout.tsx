import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { appContainerClass } from "@/config/layout";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        appContainerClass,
        "flex flex-1 flex-col items-stretch gap-6 md:flex-row md:items-start md:gap-8 lg:gap-10"
      )}
    >
      <AppSidebar />
      <div
        className={cn(
          "min-w-0 w-full flex-1",
          "rounded-2xl border border-border/70",
          "bg-card/80 shadow-sm ring-1 ring-border/20",
          "p-4 sm:p-5 md:p-6",
          "dark:bg-gradient-to-b dark:from-card/90 dark:to-muted/15 dark:shadow-md dark:ring-border/30"
        )}
      >
        {children}
      </div>
    </div>
  );
}
