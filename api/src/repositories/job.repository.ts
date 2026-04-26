import type { Prisma, Job } from "@prisma/client";
import { prisma } from "../db/client.js";

export class JobRepository {
  async findById(id: number): Promise<Job | null> {
    return prisma.job.findUnique({ where: { id } });
  }

  async list(params: {
    page: number;
    pageSize: number;
    /** Задачи конкретного пользователя либо гостевые (userId = null) */
    ownerUserId: number | null;
  }): Promise<{ rows: Job[]; total: number }> {
    const { page, pageSize, ownerUserId } = params;
    const skip = (page - 1) * pageSize;
    const where = ownerUserId === null ? { userId: null } : { userId: ownerUserId };
    const [rows, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.job.count({ where }),
    ]);
    return { rows, total };
  }

  async create(data: Prisma.JobCreateInput): Promise<Job> {
    return prisma.job.create({ data });
  }

  async remove(id: number): Promise<Job> {
    return prisma.job.delete({ where: { id } });
  }
}
