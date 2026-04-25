/**
 * Мок-данные для демо «Личного кабинета» (без бэкенда и авторизации).
 */
export const mockUser = {
  displayName: "Алексей Пробный",
  email: "aleksey.local@example.mock",
  phone: "+7 (900) 123-45-67",
  region: "Москва, Россия",
  plan: "Локальная сессия",
  planDescription: "Данные не уходят в облако; эта запись демонстрационная.",
  memberSince: "2025-10-12T09:00:00.000Z",
} as const;

export const mockStats = {
  tasksTotal: 42,
  pagesProcessed: 1_284,
  lastJobAt: "2026-04-25T11:40:00.000Z",
  storageBytes: 1_100 * 1024 * 1024,
} as const;

/** Тип события для фильтра в таблице активности */
export type MockActivityKind = "complete" | "create" | "download" | "delete";

export const mockActivity: readonly {
  id: number;
  at: string;
  kind: MockActivityKind;
  action: string;
  detail: string;
}[] = [
  { id: 1, at: "2026-04-25T11:40:00.000Z", kind: "complete", action: "Задача завершена", detail: "JS_PZ_Module_1_Week_1.pdf" },
  { id: 2, at: "2026-04-24T16:20:00.000Z", kind: "create", action: "Создана задача", detail: "Скан_договора_2024.pdf" },
  { id: 3, at: "2026-04-22T08:15:00.000Z", kind: "download", action: "Скачан результат", detail: "report.ocr.pdf" },
  { id: 4, at: "2026-04-18T14:00:00.000Z", kind: "delete", action: "Удалена задача", detail: "draft_v2.pdf" },
  { id: 5, at: "2026-04-17T09:30:00.000Z", kind: "create", action: "Создана задача", detail: "invoice_march.pdf" },
  { id: 6, at: "2026-04-15T18:05:00.000Z", kind: "complete", action: "Задача завершена", detail: "invoice_march.pdf" },
  { id: 7, at: "2026-04-10T12:00:00.000Z", kind: "download", action: "Скачан результат", detail: "archive_batch.zip" },
] as const;
