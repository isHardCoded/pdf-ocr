import type { Prisma, Job } from "@prisma/client";
export declare class JobRepository {
    findById(id: number): Promise<Job | null>;
    list(params: {
        page: number;
        pageSize: number;
    }): Promise<{
        rows: Job[];
        total: number;
    }>;
    create(data: Prisma.JobCreateInput): Promise<Job>;
    remove(id: number): Promise<Job>;
}
