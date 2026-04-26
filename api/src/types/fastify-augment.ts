import "fastify";
import type { AuthUserPayload } from "../lib/jwt.js";
import type { AuthService } from "../services/auth.service.js";

declare module "fastify" {
  interface FastifyInstance {
    authService: AuthService;
  }

  interface FastifyRequest {
    user?: AuthUserPayload;
  }
}

export {};
