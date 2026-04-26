import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service.js";
import { loginBodySchema, registerBodySchema, verifyEmailBodySchema } from "../schemas/auth.zod.js";
import { requireUser } from "../lib/require-auth.js";

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  async register(request: FastifyRequest) {
    const body = registerBodySchema.parse(request.body);
    const { mockEmailCode } = await this.auth.register(body);
    return {
      ok: true as const,
      email: body.email.trim().toLowerCase(),
      /** Мок: в продакшене код уйдёт письмом, ответ без поля */
      mockEmailCode,
    };
  }

  async verifyEmail(request: FastifyRequest) {
    const body = verifyEmailBodySchema.parse(request.body);
    await this.auth.verifyEmail(body.email, body.code);
    return { ok: true as const };
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = loginBodySchema.parse(request.body);
    const user = await this.auth.login(body.email, body.password, reply);
    return { ok: true as const, user };
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    return this.auth.explicitRefresh(request, reply);
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    await this.auth.logout(request, reply);
    return { ok: true as const };
  }

  async me(request: FastifyRequest) {
    const u = requireUser(request);
    const user = await this.auth.me(u.id);
    return { user };
  }
}
