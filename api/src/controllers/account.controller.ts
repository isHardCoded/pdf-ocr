import type { FastifyRequest } from "fastify";
import { AccountService } from "../services/account.service.js";
import { requireUser } from "../lib/require-auth.js";

export class AccountController {
  constructor(private readonly account: AccountService) {}

  async summary(request: FastifyRequest) {
    const user = requireUser(request);
    return this.account.getSummary(user);
  }
}
