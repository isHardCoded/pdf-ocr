import "./config/bootstrap.js";
import { ZodError } from "zod";
import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "./config/env.js";
import { isAppError } from "./lib/app-error.js";
import jobPlugin from "./routes/jobs.plugin.js";
export async function buildApp() {
    const app = fastify({
        logger: env.nodeEnv === "development" ? { level: "info" } : { level: "error" },
    });
    app.setErrorHandler((err, request, reply) => {
        if (isAppError(err)) {
            return reply.status(err.statusCode).send({ error: err.message, code: err.code });
        }
        if (err instanceof ZodError) {
            return reply.status(400).send({ error: err.issues, code: "zod" });
        }
        const anyErr = err;
        if (anyErr.validation) {
            return reply.status(400).send({ error: anyErr.message, code: "validation" });
        }
        if (anyErr?.statusCode === 400 && anyErr.message) {
            return reply.status(400).send({ error: anyErr.message, code: "bad_request" });
        }
        void request.id;
        app.log.error({ err, url: request.url, method: request.method });
        return reply.status(500).send({ error: "Internal error", code: "internal" });
    });
    await app.register(cors, {
        origin: true,
        methods: ["GET", "POST", "DELETE", "HEAD", "OPTIONS", "PUT", "PATCH"],
    });
    await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 * 1024 } });
    await app.register(jobPlugin);
    app.get("/health", () => ({ status: "ok" }));
    return app;
}
