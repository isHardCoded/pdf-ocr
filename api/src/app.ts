import "./config/bootstrap.js";
import "./types/fastify-augment.js";
import { ZodError } from "zod";
import fastify, { type FastifyInstance, type FastifyError } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { env } from "./config/env.js";
import { isAppError } from "./lib/app-error.js";
import { AuthService } from "./services/auth.service.js";
import { UserRepository } from "./repositories/user.repository.js";
import { RefreshSessionRepository } from "./repositories/refresh-session.repository.js";
import jobPlugin from "./routes/jobs.plugin.js";
import authPlugin from "./routes/auth.plugin.js";
import accountPlugin from "./routes/account.plugin.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: env.nodeEnv === "development" ? { level: "info" } : { level: "error" },
  });
  app.setErrorHandler((err: unknown, request, reply) => {
    if (isAppError(err)) {
      return reply.status(err.statusCode).send({ error: err.message, code: err.code });
    }
    if (err instanceof ZodError) {
      return reply.status(400).send({ error: err.issues, code: "zod" });
    }
    const anyErr = err as FastifyError & { validation?: unknown; message: string; statusCode?: number };
    if (anyErr.validation) {
      return reply.status(400).send({ error: anyErr.message, code: "validation" });
    }
    if (anyErr?.statusCode === 400 && anyErr.message) {
      return reply.status(400).send({ error: anyErr.message, code: "bad_request" });
    }
    app.log.error({ err, id: request.id, url: request.url, method: request.method });
    return reply.status(500).send({ error: "Internal error", code: "internal" });
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "HEAD", "OPTIONS", "PUT", "PATCH"],
  });
  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

  const authService = new AuthService(new UserRepository(), new RefreshSessionRepository());
  app.decorate("authService", authService);

  app.addHook("onRequest", async (request, reply) => {
    await app.authService.attachUserToRequest(request, reply);
  });

  await app.register(authPlugin);
  await app.register(accountPlugin);
  await app.register(jobPlugin);

  app.get("/health", () => ({ status: "ok" } as const));
  return app;
}
