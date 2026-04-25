export class AppError extends Error {
  readonly code: string;

  constructor(
    public readonly statusCode: number,
    message: string,
    code?: string
  ) {
    super(message);
    this.name = "AppError";
    this.code = code ?? "app_error";
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
