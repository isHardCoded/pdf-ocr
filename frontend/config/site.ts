export const site = {
  name: "PDF OCR",
  tagline: "текст из сканов и фото в PDF",
  description:
    "Сервис на вашем компьютере: загружаете PDF со сканами — получаете документ, из которого можно копировать текст. Файлы не отправляются в интернет.",
} as const;

export const mainNav = [
  { href: "/" as const, label: "Загрузить PDF" },
  { href: "/jobs" as const, label: "Мои файлы" },
] as const;
