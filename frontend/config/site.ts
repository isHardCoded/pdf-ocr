/** Central place for app copy, nav, and metadata strings. */
export const site = {
  name: "PDF OCR",
  tagline: "сканы → копируемый текст",
  description:
    "Локальный конвертер PDF: делает отсканированные страницы с выделяемым текстом через OCRmyPDF и Tesseract.",
} as const;

export const mainNav = [
  { href: "/" as const, label: "Новая задача" },
  { href: "/jobs" as const, label: "История" },
] as const;
