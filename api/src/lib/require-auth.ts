import type { FastifyRequest } from "fastify";
import { AppError } from "./app-error.js";
import type { AuthUserPayload } from "./jwt.js";

export function requireUser(request: FastifyRequest): AuthUserPayload {
  if (!request.user) {
    throw new AppError(401, "Требуется вход в аккаунт", "unauthorized");
  }
  return request.user;
}
