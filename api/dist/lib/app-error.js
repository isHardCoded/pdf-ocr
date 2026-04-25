export class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
        this.code = code ?? "app_error";
    }
}
export function isAppError(e) {
    return e instanceof AppError;
}
