/** Правила совпадают с бэкендом (`api/src/schemas/auth.zod.ts`) */

const CYRILLIC_NAME =
  /^[\p{Script=Cyrillic}]+(?:[\s-][\p{Script=Cyrillic}]+)*$/u;

export function validateFullName(value: string): string | null {
  const s = value.trim();
  if (s.length < 2) return "Минимум 2 символа";
  if (s.length > 120) return "Слишком длинное имя";
  if (!CYRILLIC_NAME.test(s)) {
    return "Имя должно содержать только русские буквы (можно пробел или дефис между словами)";
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const s = value.trim();
  if (s.length < 3) return "Введите email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(s)) return "Введите корректный адрес с символом @";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Пароль: минимум 8 символов";
  if (!/[A-Z]/u.test(value)) return "Пароль: нужна хотя бы одна заглавная латинская буква";
  if (!/\d/u.test(value)) return "Пароль: нужна хотя бы одна цифра";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/u.test(value)) {
    return "Пароль: нужен хотя бы один специальный знак (!@#$% и т.п.)";
  }
  return null;
}
