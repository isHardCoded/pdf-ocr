import { z } from "zod";

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(120)
  .refine(
    (s) => /^[\p{Script=Cyrillic}]+(?:[\s-][\p{Script=Cyrillic}]+)*$/u.test(s),
    "Имя должно содержать только русские буквы (можно пробел или дефис между словами)"
  );

const emailSchema = z.string().trim().min(3).email("Введите корректный адрес с символом @");

const passwordComplexitySchema = z
  .string()
  .min(8, "Пароль: минимум 8 символов")
  .regex(/[A-Z]/, "Пароль: нужна хотя бы одна заглавная латинская буква")
  .regex(/\d/u, "Пароль: нужна хотя бы одна цифра")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/u,
    "Пароль: нужен хотя бы один специальный знак (!@#$% и т.п.)"
  );

export const registerBodySchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordComplexitySchema,
    passwordConfirmation: z.string(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Пароли не совпадают",
        path: ["passwordConfirmation"],
      });
    }
  });

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const verifyEmailBodySchema = z
  .object({
    email: emailSchema,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/u, "Код из 6 цифр"),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Введите пароль"),
  })
  .strict();
