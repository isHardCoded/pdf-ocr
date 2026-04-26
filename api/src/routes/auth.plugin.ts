import type { FastifyPluginAsync } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const controller = new AuthController(fastify.authService);

  fastify.post("/auth/register", (req) => controller.register(req));
  fastify.post("/auth/verify-email", (req) => controller.verifyEmail(req));
  fastify.post("/auth/login", (req, rep) => controller.login(req, rep));
  fastify.post("/auth/refresh", (req, rep) => controller.refresh(req, rep));
  fastify.post("/auth/logout", (req, rep) => controller.logout(req, rep));
  fastify.get("/auth/me", (req) => controller.me(req));
};

export default authPlugin;
