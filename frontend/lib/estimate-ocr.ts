import type { OcrMode } from "@/features/ocr";

/** Очень грубая оценка числа страниц по размеру файла (скан ~150–400 КБ/стр.). */
function guessPageCount(fileSizeBytes: number): number {
  const low = Math.max(1, Math.ceil(fileSizeBytes / (400 * 1024)));
  const high = Math.max(1, Math.ceil(fileSizeBytes / (120 * 1024)));
  return Math.max(1, Math.round((low + high) / 2));
}

/**
 * Ориентир по времени: ~3 c/стр. на типичный ПК при force_ocr; skip_text быстрее.
 * Диапазон ±50% из-за DPI и режима.
 */
export function estimateOcrRange(
  fileSizeBytes: number,
  mode: OcrMode
): { pagesApprox: number; minutesMin: number; minutesMax: number; label: string } {
  const pagesApprox = guessPageCount(fileSizeBytes);
  const secPerPage = mode === "skip_text" ? 1.2 : mode === "redo_ocr" ? 2.2 : 3.0;
  const baseSec = pagesApprox * secPerPage;
  const factorMin = 0.45;
  const factorMax = 1.8;
  const minutesMin = Math.max(1, Math.ceil((baseSec * factorMin) / 60));
  const minutesMax = Math.max(minutesMin + 1, Math.ceil((baseSec * factorMax) / 60));
  const label =
    minutesMax <= 3
      ? "обычно несколько минут"
      : minutesMax <= 30
        ? `примерно ${minutesMin}–${minutesMax} мин`
        : `примерно ${minutesMin}–${minutesMax} мин (большие файлы могут идти час и дольше)`;
  return { pagesApprox, minutesMin, minutesMax, label };
}
