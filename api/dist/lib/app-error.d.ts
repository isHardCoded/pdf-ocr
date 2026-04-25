export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(statusCode: number, message: string, code?: string);
}
export declare function isAppError(e: unknown): e is AppError;
