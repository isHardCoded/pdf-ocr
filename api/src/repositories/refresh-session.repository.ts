import { prisma } from "../db/client.js";

export class RefreshSessionRepository {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.refreshSession.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findByTokenHash(tokenHash: string) {
    return prisma.refreshSession.findUnique({ where: { tokenHash } });
  }

  async deleteById(id: number): Promise<void> {
    await prisma.refreshSession.delete({ where: { id } });
  }

  async deleteAllForUser(userId: number): Promise<void> {
    await prisma.refreshSession.deleteMany({ where: { userId } });
  }

  /** Ротация: удалить старую сессию и создать новую в одной транзакции */
  async rotate(
    oldTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date
  ): Promise<{ userId: number } | null> {
    return prisma.$transaction(async (tx) => {
      const row = await tx.refreshSession.findUnique({ where: { tokenHash: oldTokenHash } });
      if (!row) return null;
      if (row.expiresAt.getTime() < Date.now()) {
        await tx.refreshSession.delete({ where: { id: row.id } }).catch(() => {});
        return null;
      }
      await tx.refreshSession.delete({ where: { id: row.id } });
      await tx.refreshSession.create({
        data: { userId: row.userId, tokenHash: newTokenHash, expiresAt: newExpiresAt },
      });
      return { userId: row.userId };
    });
  }
}
