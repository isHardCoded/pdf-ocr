"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  className?: string;
  /** Сколько номеров страниц показать вокруг текущей */
  siblingCount?: number;
  disabled?: boolean;
}

/**
 * Универсальная пагинация: назад, номера, вперёд. Рендерит только при totalPages &gt; 1.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages, siblingCount);

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      aria-label="Пагинация"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Предыдущая страница"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((item, i) =>
        item === "…" ? (
          <span
            key={`e-${i}`}
            className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === page ? "secondary" : "ghost"}
            size="sm"
            className="h-9 min-w-9 px-0"
            disabled={disabled}
            onClick={() => onPageChange(item)}
            aria-label={`Страница ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        )
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Следующая страница"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

function buildPageList(current: number, total: number, delta: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
