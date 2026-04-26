import type { FastifyPluginAsync } from "fastify";
import { AccountController } from "../controllers/account.controller.js";
import { AccountService } from "../services/account.service.js";

const accountPlugin: FastifyPluginAsync = async (fastify) => {
  const controller = new AccountController(new AccountService());

  fastify.get("/account/summary", (req) => controller.summary(req));
};

export default accountPlugin;
