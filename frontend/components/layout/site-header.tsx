"use client";

import Link from "next/link";
import { FileText, LogIn, LogOut, User } from "lucide-react";

import { site } from "@/config/site";
import { appContainerClass } from "@/config/layout";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { status, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div
        className={cn(
          appContainerClass,
          "flex h-16 items-center justify-between gap-4"
        )}
      >
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary/15 group-hover:ring-primary/30">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">{site.name}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">{site.tagline}</span>
          </span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {status === "loading" ? (
            <span className="h-9 w-9 rounded-lg bg-muted/50" aria-hidden />
          ) : status === "guest" ? (
            <>
              <Button type="button" variant="ghost" size="sm" className="hidden h-9 rounded-lg px-2 sm:inline-flex" asChild>
                <Link href="/login">Войти</Link>
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-9 rounded-lg px-2 text-xs sm:text-sm" asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline" title={user.email}>
                {user.fullName}
              </span>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-lg p-0" asChild>
                <Link href="/account" aria-label="Личный кабинет">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg p-0"
                aria-label="Выйти"
                onClick={() => void logout()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          {status === "guest" ? (
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-lg p-0 sm:hidden" asChild>
              <Link href="/login" aria-label="Войти">
                <LogIn className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
