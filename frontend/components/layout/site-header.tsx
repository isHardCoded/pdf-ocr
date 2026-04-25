"use client";

import Link from "next/link";
import { FileText, User } from "lucide-react";

import { site } from "@/config/site";
import { appContainerClass } from "@/config/layout";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function SiteHeader() {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-lg" aria-label="Профиль">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm">Профиль</div>
                <p className="text-xs text-muted-foreground">Демо-кабинет, без реальной авторизации.</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account" className="cursor-pointer">
                  Личный кабинет
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
