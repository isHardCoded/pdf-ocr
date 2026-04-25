"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Calendar, HardDrive, Layers, ListChecks, Mail, Search } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatBytes } from "@/lib/utils";
import { mockActivity, mockStats, mockUser, type MockActivityKind } from "@/lib/mock-account";

function initials(name: string) {
  const p = name.trim().split(/\s+/u);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`.toUpperCase() || "??";
}

function formatRuDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatRuDateLong(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const KIND_FILTER_ALL = "all" as const;
type ActivityFilter = typeof KIND_FILTER_ALL | MockActivityKind;

const KIND_FILTER_LABELS: Record<ActivityFilter, string> = {
  all: "Все типы",
  complete: "Завершение",
  create: "Создание",
  download: "Скачивание",
  delete: "Удаление",
};

type SortColumn = "at" | "action" | "detail";
type SortDirection = "asc" | "desc";

function compareAt(a: string, b: string) {
  return new Date(a).getTime() - new Date(b).getTime();
}

function SortHeader({
  label,
  column,
  activeColumn,
  direction,
  onSort,
}: {
  label: string;
  column: SortColumn;
  activeColumn: SortColumn;
  direction: SortDirection;
  onSort: (c: SortColumn) => void;
}) {
  const active = activeColumn === column;
  return (
    <th scope="col" className="h-11 px-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md py-1 pr-1 text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "text-foreground"
        )}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          )
        ) : (
          <span className="inline-block w-3.5 shrink-0" aria-hidden />
        )}
      </button>
    </th>
  );
}

export function AccountView() {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<ActivityFilter>(KIND_FILTER_ALL);
  const [sortColumn, setSortColumn] = useState<SortColumn>("at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const onSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "at" ? "desc" : "asc");
    }
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...mockActivity];
    if (kindFilter !== KIND_FILTER_ALL) {
      rows = rows.filter((r) => r.kind === kindFilter);
    }
    if (q) {
      rows = rows.filter(
        (r) =>
          r.action.toLowerCase().includes(q) ||
          r.detail.toLowerCase().includes(q) ||
          formatRuDateTime(r.at).toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "at") cmp = compareAt(a.at, b.at);
      else if (sortColumn === "action") cmp = a.action.localeCompare(b.action, "ru");
      else cmp = a.detail.localeCompare(b.detail, "ru", { sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [search, kindFilter, sortColumn, sortDirection]);

  return (
    <PageContainer>
      <div className="space-y-8 py-1 sm:py-2">
        <header className="border-b border-border/50 pb-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Личный кабинет</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Здесь показан пример того, как может выглядеть профиль. Вход по паролю пока не подключён.
          </p>
        </header>

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-xl font-semibold text-primary"
                aria-hidden
              >
                {initials(mockUser.displayName)}
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">{mockUser.displayName}</CardTitle>
                  <CardDescription className="mt-1.5 text-sm">
                    Имя и почта ниже — только для примера в интерфейсе.
                  </CardDescription>
                </div>
                <Separator />
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="flex gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Электронная почта</dt>
                      <dd className="mt-0.5 break-all text-sm font-medium">{mockUser.email}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <dt className="text-xs text-muted-foreground">С нами с</dt>
                      <dd className="mt-0.5 text-sm font-medium">{formatRuDateLong(mockUser.memberSince)}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </CardHeader>
        </Card>

        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-sm font-medium text-muted-foreground">
            Статистика
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Задачи</p>
                  <ListChecks className="h-4 w-4 text-primary/80" aria-hidden />
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{mockStats.tasksTotal}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">всего обработано (пример)</p>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Страницы</p>
                  <Layers className="h-4 w-4 text-primary/80" aria-hidden />
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {mockStats.pagesProcessed.toLocaleString("ru-RU")}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">страниц с текстом (пример)</p>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Хранилище</p>
                  <HardDrive className="h-4 w-4 text-primary/80" aria-hidden />
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatBytes(mockStats.storageBytes)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">занято под файлы (пример)</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="border-border/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base sm:text-lg">Активность</CardTitle>
            <CardDescription>
              Пример журнала: можно искать по словам, отфильтровать по типу действия и отсортировать столбцы.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по событию или файлу…"
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent py-2 pl-9 pr-3 text-sm shadow-sm ring-offset-background",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  aria-label="Поиск по активности"
                />
              </div>
              <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as ActivityFilter)}>
                <SelectTrigger className="w-full sm:w-[200px]" aria-label="Фильтр по типу события">
                  <SelectValue placeholder="Тип события" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_FILTER_LABELS) as ActivityFilter[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {KIND_FILTER_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full min-w-[520px] caption-bottom text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <SortHeader
                      label="Дата"
                      column="at"
                      activeColumn={sortColumn}
                      direction={sortDirection}
                      onSort={onSort}
                    />
                    <SortHeader
                      label="Событие"
                      column="action"
                      activeColumn={sortColumn}
                      direction={sortDirection}
                      onSort={onSort}
                    />
                    <SortHeader
                      label="Подробности"
                      column="detail"
                      activeColumn={sortColumn}
                      direction={sortDirection}
                      onSort={onSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-10 text-center text-muted-foreground">
                        Нет записей по заданным условиям.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 align-top text-xs tabular-nums text-muted-foreground">
                          <time dateTime={row.at}>{formatRuDateTime(row.at)}</time>
                        </td>
                        <td className="px-3 py-2.5 align-top font-medium">{row.action}</td>
                        <td className="max-w-[min(28rem,40vw)] break-words px-3 py-2.5 align-top text-muted-foreground">
                          {row.detail}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Последняя обработка (пример): {formatRuDateTime(mockStats.lastJobAt)}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
