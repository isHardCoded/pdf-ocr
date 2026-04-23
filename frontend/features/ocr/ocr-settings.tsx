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
        <CardTitle className="text-sm font-medium">Параметры</CardTitle>
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
              Нужен другой язык — поставьте пакет{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">tesseract-ocr-…</code> в Docker.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opt">Сжатие PDF после OCR</Label>
            <Select
              value={String(value.optimize)}
              onValueChange={(v) => set("optimize", Number(v))}
              disabled={disabled}
            >
              <SelectTrigger id="opt" className="w-full">
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Без оптимизации</SelectItem>
                <SelectItem value="1">Базовая</SelectItem>
                <SelectItem value="2">Сильная</SelectItem>
                <SelectItem value="3">Максимальная (по умолчанию)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Меньше размер файла, текст не теряется.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="mode">Страницы: когда делать новый OCR</Label>
          <Select
            value={value.mode}
            onValueChange={(v) => set("mode", v as OcrSettingsValue["mode"])}
            disabled={disabled}
          >
            <SelectTrigger id="mode" className="w-full">
              <SelectValue placeholder="Режим" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force_ocr">Все страницы (лучше для сканов)</SelectItem>
              <SelectItem value="redo_ocr">Только сомнительный / старый слой</SelectItem>
              <SelectItem value="skip_text">Пропустить, если в PDF уже есть текст</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs leading-relaxed text-muted-foreground">
            «Пропустить» оставляет страницы, где в PDF помечен текстовый слой — в «шумных» сканах
            копирование иногда остаётся лишь с части страниц. Для длинных сканов без цифрового текста
            выберите «Все страницы».
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="deskew" className="text-base">
              Выровнять наклон (deskew)
            </Label>
            <p className="text-xs text-muted-foreground">Повернуть перекошенные страницы скана.</p>
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
