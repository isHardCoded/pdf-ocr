"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { OcrSettingsValue } from "./types";

interface OcrSettingsProps {
  value: OcrSettingsValue;
  onChange: (v: OcrSettingsValue) => void;
  disabled?: boolean;
  className?: string;
}

export function OcrSettings({ value, onChange, disabled, className }: OcrSettingsProps) {
  const set = <K extends keyof OcrSettingsValue>(k: K, v: OcrSettingsValue[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <Card className={cn("border-border/70", className)}>
      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
        <CardTitle className="text-sm font-medium">Дополнительно</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-4 pt-2 sm:p-5 sm:pt-2">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lang">Язык</Label>
            <Select
              value={value.language}
              onValueChange={(v) => set("language", v)}
              disabled={disabled}
            >
              <SelectTrigger id="lang" className="w-full">
                <SelectValue placeholder="Язык" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rus">Русский</SelectItem>
                <SelectItem value="rus+eng">Русский + английский</SelectItem>
                <SelectItem value="eng">Английский</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Выберите язык, которым в основном написан документ — так текст получится точнее.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opt">Насколько сильно ужать готовый файл</Label>
            <Select
              value={String(value.optimize)}
              onValueChange={(v) => set("optimize", Number(v))}
              disabled={disabled}
            >
              <SelectTrigger id="opt" className="w-full">
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Не ужимать</SelectItem>
                <SelectItem value="1">Чуть меньше размер</SelectItem>
                <SelectItem value="2">Заметно меньше размер</SelectItem>
                <SelectItem value="3">Как можно меньше размер (по умолчанию)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Сильнее сжатие — меньше размер на диске, читаемость обычно не страдает.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="mode">Какие страницы обрабатывать заново</Label>
          <Select
            value={value.mode}
            onValueChange={(v) => set("mode", v as OcrSettingsValue["mode"])}
            disabled={disabled}
          >
            <SelectTrigger id="mode" className="w-full">
              <SelectValue placeholder="Режим" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force_ocr">Все страницы — обычно так и нужно для сканов</SelectItem>
              <SelectItem value="redo_ocr">Только там, где текст выглядит «битым»</SelectItem>
              <SelectItem value="skip_text">Не трогать страницы, где текст уже распознан</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Обычный скан или фото документа — выбирайте первый пункт. Последний пункт подходит, если в файле уже
            есть нормальный текст и не хочется обрабатывать всё заново.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="deskew" className="text-base">
              Выровнять слегка перекошенные страницы
            </Label>
            <p className="text-xs text-muted-foreground">Полезно, если скан «уехал» на бок при подаче в сканер.</p>
          </div>
          <Switch
            id="deskew"
            checked={value.deskew}
            disabled={disabled}
            onCheckedChange={(v) => set("deskew", v)}
            className="shrink-0"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export type { OcrSettingsValue } from "./types";
