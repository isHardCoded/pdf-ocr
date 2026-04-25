"use client";

import { useState } from "react";
import { Bell, Calendar, HardDrive, Layers, ListChecks, MapPin, Mail, Phone } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatBytes } from "@/lib/utils";
import { mockActivity, mockNotificationsPreview, mockStats, mockUser } from "@/lib/mock-account";

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

const mockStorageBytes = 1_100 * 1024 * 1024;

export function AccountView() {
  const [emailDigest, setEmailDigest] = useState<boolean>(mockNotificationsPreview.emailDigest);
  const [productNews, setProductNews] = useState<boolean>(mockNotificationsPreview.productNews);

  return (
    <PageContainer>
      <div className="space-y-8">
        <header className="border-b border-border/50 pb-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Личный кабинет</h1>
          <p className="mt-1 text-sm text-muted-foreground">Демонстрационные данные — без реальной привязки к аккаунту.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px),1fr]">
          <Card className="overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="pb-4 text-center sm:text-left">
              <div className="mb-3 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-4">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-2xl font-semibold text-primary"
                  aria-hidden
                >
                  {initials(mockUser.displayName)}
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-lg font-semibold leading-tight">{mockUser.displayName}</p>
                  <Badge className="mt-2" variant="muted">
                    {mockUser.plan}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-left text-xs sm:text-sm">{mockUser.planDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
              <Separator className="mb-4" />
              <ul className="space-y-3 text-sm" aria-label="Контакты (мок)">
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="break-all font-medium">{mockUser.email}</p>
                  </div>
                </li>
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="text-xs text-muted-foreground">Телефон</p>
                    <p className="font-medium">{mockUser.phone}</p>
                  </div>
                </li>
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="text-xs text-muted-foreground">Регион</p>
                    <p className="font-medium">{mockUser.region}</p>
                  </div>
                </li>
                <li className="flex gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="text-xs text-muted-foreground">С нами (мок)</p>
                    <p className="font-medium">c {formatRuDateLong(mockUser.memberSince)}</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Статистика (мок)</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Card className="border-border/70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Задач</p>
                      <ListChecks className="h-4 w-4 text-primary/80" aria-hidden />
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{mockStats.tasksTotal}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">всего (демо)</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Страниц</p>
                      <Layers className="h-4 w-4 text-primary/80" aria-hidden />
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {mockStats.pagesProcessed.toLocaleString("ru-RU")}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">оценка OCR</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Хранилище</p>
                      <HardDrive className="h-4 w-4 text-primary/80" aria-hidden />
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{formatBytes(mockStorageBytes)}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">каталог /data (пример)</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Bell className="h-4 w-4" aria-hidden />
                  Уведомления
                </CardTitle>
                <CardDescription>Только в интерфейсе; на сервер не отправляется.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Сводка по email</p>
                    <p className="text-xs text-muted-foreground">Раз в неделю, если бы был сервер</p>
                  </div>
                  <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Новости продукта</p>
                    <p className="text-xs text-muted-foreground">Обновления интерфейса (мок)</p>
                  </div>
                  <Switch checked={productNews} onCheckedChange={setProductNews} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Активность (мок)</CardTitle>
                <CardDescription>Недавние события для демо.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border/50 rounded-lg border border-border/50">
                  {mockActivity.map((row) => (
                    <li key={row.id} className="flex flex-col gap-0.5 px-3 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
                      <time className="shrink-0 text-xs tabular-nums text-muted-foreground" dateTime={row.at}>
                        {formatRuDateTime(row.at)}
                      </time>
                      <div className="min-w-0 flex-1 text-sm">
                        <span className="font-medium">{row.action}</span>
                        <span className="text-muted-foreground"> — </span>
                        <span className="break-words text-muted-foreground">{row.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Последняя задача (мок): {formatRuDateTime(mockStats.lastJobAt)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
