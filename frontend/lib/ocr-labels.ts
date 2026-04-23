import type { OcrMode } from "@/features/ocr";

const modeLabels: Record<OcrMode, string> = {
  force_ocr: "OCR всех страниц",
  redo_ocr: "Пересоздать сомнительный слой",
  skip_text: "Пропуск при наличии текста",
};

const langLabels: Record<string, string> = {
  rus: "Русский",
  "rus+eng": "Русский + English",
  eng: "English",
};

const optLabels: Record<number, string> = {
  0: "без сжатия",
  1: "базовое",
  2: "сильное",
  3: "максимальное",
};

export function labelMode(m: OcrMode): string {
  return modeLabels[m] ?? m;
}

export function labelLanguage(code: string): string {
  return langLabels[code] ?? code;
}

export function labelOptimize(n: number): string {
  return optLabels[n] ?? String(n);
}
