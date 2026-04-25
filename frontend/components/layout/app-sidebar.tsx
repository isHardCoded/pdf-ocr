"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Upload } from "lucide-react";

import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";

const tabIcons = {
  "/": Upload,
  "/jobs": History,
} as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-full shrink-0 md:sticky md:top-20 md:self-start md:w-64 lg:w-72"
      aria-label="Разделы"
    >
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80",
          "bg-gradient-to-b from-card/90 to-card/50 shadow-sm",
          "dark:from-card/50 dark:to-muted/20 dark:shadow-md dark:ring-1 dark:ring-border/40"
        )}
      >
        <nav
          className="flex flex-1 flex-row gap-1.5 p-2 sm:max-w-2xl sm:mx-auto md:mx-0 md:max-w-none md:flex-col md:gap-2"
          role="tablist"
        >
          {mainNav.map((item) => {
            const I = tabIcons[item.href];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-1 items-center justify-center gap-3 rounded-xl",
                  "px-4 py-3.5 text-left text-sm font-medium transition-all sm:text-base",
                  "md:min-h-[3.5rem] md:justify-start md:py-3.5",
                  isActive
                    ? "bg-primary/12 text-foreground ring-1 ring-inset ring-primary/30 shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    isActive ? "bg-primary/20 text-primary" : "bg-muted/80 text-muted-foreground"
                  )}
                >
                  <I className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 sm:text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
