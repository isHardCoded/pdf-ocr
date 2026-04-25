import { prisma } from "../db/client.js";
export class JobRepository {
    async findById(id) {
        return prisma.job.findUnique({ where: { id } });
    }
    async list(params) {
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
    async create(data) {
        return prisma.job.create({ data });
    }
    async remove(id) {
        return prisma.job.delete({ where: { id } });
    }
}
