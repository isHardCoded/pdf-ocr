import type { Prisma, User } from "@prisma/client";
import { prisma } from "../db/client.js";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateVerificationState(
    id: number,
    patch: Pick<User, "emailVerified"> &
      Partial<Pick<User, "emailVerificationCodeHash" | "emailVerificationExpiresAt">>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        emailVerified: patch.emailVerified,
        emailVerificationCodeHash: patch.emailVerificationCodeHash ?? null,
        emailVerificationExpiresAt: patch.emailVerificationExpiresAt ?? null,
      },
    });
  }
}
