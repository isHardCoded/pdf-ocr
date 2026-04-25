import type { Prisma, Job } from "@prisma/client";
import { prisma } from "../db/client.js";

export class JobRepository {
  async findById(id: number): Promise<Job | null> {
    return prisma.job.findUnique({ where: { id } });
  }

  async list(params: { page: number; pageSize: number }): Promise<{ rows: Job[]; total: number }> {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;
    const [rows, total] = await Promise.all([
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.job.count(),
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
