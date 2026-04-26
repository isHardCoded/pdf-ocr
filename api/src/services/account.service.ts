import { prisma } from "../db/client.js";
import { AppError } from "../lib/app-error.js";
import type { AuthUserPayload } from "../lib/jwt.js";
import { toJobOut } from "../mappers/job.mapper.js";

export type AccountActivityKind = "create" | "complete" | "failed";

export type AccountActivityRow = {
  id: string;
  at: string;
  kind: AccountActivityKind;
  action: string;
  detail: string;
};

export type AccountSummary = {
  user: {
    fullName: string;
    email: string;
    emailVerified: boolean;
    memberSince: string;
  };
  stats: {
    tasksTotal: number;
    pagesProcessed: number;
    storageBytes: number;
    lastJobAt: string | null;
  };
  activity: AccountActivityRow[];
};

export class AccountService {
  async getSummary(auth: AuthUserPayload): Promise<AccountSummary> {
    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!user) {
      throw new AppError(401, "Пользователь не найден", "not_found");
    }

    const userId = user.id;

    const [tasksTotal, pagesAgg, storageAgg, lastJob, jobs] = await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.job.aggregate({
        where: { userId, status: "completed" },
        _sum: { totalPages: true },
      }),
      prisma.job.aggregate({
        where: { userId },
        _sum: { inputSize: true, outputSize: true },
      }),
      prisma.job.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.job.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
    ]);

    const pagesProcessed = pagesAgg._sum.totalPages ?? 0;
    const storageBytes = (storageAgg._sum.inputSize ?? 0) + (storageAgg._sum.outputSize ?? 0);
    const lastJobAt = lastJob?.createdAt.toISOString() ?? null;

    const activity = this.buildActivity(jobs.map(toJobOut));

    return {
      user: {
        fullName: user.fullName,
        email: user.email,
        emailVerified: user.emailVerified,
        memberSince: user.createdAt.toISOString(),
      },
      stats: {
        tasksTotal,
        pagesProcessed,
        storageBytes,
        lastJobAt,
      },
      activity,
    };
  }

  private buildActivity(
    jobs: Array<{
      id: number;
      filename: string;
      status: string;
      created_at: string;
      completed_at?: string | null;
    }>
  ): AccountActivityRow[] {
    const rows: AccountActivityRow[] = [];
    for (const j of jobs) {
      rows.push({
        id: `c-${j.id}`,
        at: j.created_at,
        kind: "create",
        action: "Создана задача",
        detail: j.filename,
      });
      if (j.status === "completed" && j.completed_at) {
        rows.push({
          id: `d-${j.id}`,
          at: j.completed_at,
          kind: "complete",
          action: "Задача завершена",
          detail: j.filename,
        });
      } else if (j.status === "failed") {
        rows.push({
          id: `f-${j.id}`,
          at: j.completed_at ?? j.created_at,
          kind: "failed",
          action: "Ошибка обработки",
          detail: j.filename,
        });
      }
    }
    rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return rows;
  }
}
