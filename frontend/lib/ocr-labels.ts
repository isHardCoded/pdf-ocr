import type { OcrMode } from "@/features/ocr";

const modeLabels: Record<OcrMode, string> = {
  force_ocr: "все страницы (как для обычного скана)",
  redo_ocr: "только сомнительные места",
  skip_text: "не трогать страницы, где текст уже есть",
};

const langLabels: Record<string, string> = {
  rus: "Русский",
  "rus+eng": "Русский + English",
  eng: "English",
};

const optLabels: Record<number, string> = {
  0: "без ужатия",
  1: "слегка уменьшить",
  2: "сильнее уменьшить",
  3: "как можно компактнее",
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
