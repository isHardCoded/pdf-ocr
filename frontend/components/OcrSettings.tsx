"use client";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Switch } from "./ui/switch";

export interface OcrSettingsValue {
  language: string;
  optimize: number;
  deskew: boolean;
  mode: "skip_text" | "force_ocr" | "redo_ocr";
}

interface Props {
  value: OcrSettingsValue;
  onChange: (v: OcrSettingsValue) => void;
  disabled?: boolean;
}

export function OcrSettings({ value, onChange, disabled }: Props) {
  const set = <K extends keyof OcrSettingsValue>(
    k: K,
    v: OcrSettingsValue[K]
  ) => onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="lang">Язык</Label>
        <Select
          id="lang"
          value={value.language}
          disabled={disabled}
          onChange={(e) => set("language", e.target.value)}
        >
          <option value="rus">Русский</option>
          <option value="rus+eng">Русский + Английский</option>
          <option value="eng">Английский</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          Дополнительные языки можно добавить, установив пакеты
          tesseract-ocr-*.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mode">Что делать со страницами, где уже есть текст</Label>
        <Select
          id="mode"
          value={value.mode}
          disabled={disabled}
          onChange={(e) =>
            set("mode", e.target.value as OcrSettingsValue["mode"])
          }
        >
          <option value="skip_text">Пропустить (рекомендуется)</option>
          <option value="redo_ocr">Пересканировать сомнительные</option>
          <option value="force_ocr">Пересканировать все страницы</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opt">Оптимизация размера</Label>
        <Select
          id="opt"
          value={String(value.optimize)}
          disabled={disabled}
          onChange={(e) => set("optimize", Number(e.target.value))}
        >
          <option value="0">Без оптимизации</option>
          <option value="1">Базовая</option>
          <option value="2">Сильная</option>
          <option value="3">Максимальная (рекомендуется)</option>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-4 py-3">
        <div>
          <Label htmlFor="deskew">Выравнивание наклона (deskew)</Label>
          <p className="text-xs text-muted-foreground">
            Автоматически поворачивает перекошенные сканы.
          </p>
        </div>
        <Switch
          id="deskew"
          checked={value.deskew}
          disabled={disabled}
          onCheckedChange={(v) => set("deskew", v)}
        />
      </div>
    </div>
  );
}
