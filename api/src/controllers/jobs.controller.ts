import type { FastifyRequest, FastifyReply } from "fastify";
import { JobService } from "../services/job.service.js";
import { progressSse } from "../lib/sse.js";
import { AppError } from "../lib/app-error.js";

const jobIdParam = (p: { job_id?: string }) => {
  const id = Number(p["job_id"]);
  if (!Number.isFinite(id)) {
    throw new AppError(400, "Invalid job id", "bad_id");
  }
  return id;
};

export class JobsController {
  constructor(private readonly service: JobService) {}

  create(request: FastifyRequest) {
    return this.service.createFromMultipart(() => request.parts());
  }

  list(request: FastifyRequest) {
    return this.service.list(request.query);
  }

  get(request: FastifyRequest) {
    return this.service.getById(jobIdParam(request.params as { job_id: string }));
  }

  async remove(request: FastifyRequest) {
    await this.service.deleteJob(jobIdParam(request.params as { job_id: string }));
    return { ok: true } as const;
  }

  async download(request: FastifyRequest, reply: FastifyReply) {
    const id = jobIdParam(request.params as { job_id: string });
    const row = await this.service.getRowOrThrow(id);
    const { stream, downloadName } = await this.service.getDownloadStream(row);
    return reply
      .header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`)
      .type("application/pdf")
      .send(stream);
  }

  async preview(request: FastifyRequest, reply: FastifyReply) {
    const id = jobIdParam(request.params as { job_id: string });
    const row = await this.service.getRowOrThrow(id);
    const { stream } = await this.service.getPreviewStream(row);
    return reply.type("application/pdf").send(stream);
  }

  stream(request: FastifyRequest, reply: FastifyReply) {
    const id = jobIdParam(request.params as { job_id: string });
    return (async () => {
      await this.service.getRowOrThrow(id);
      return progressSse(request, reply, async () => {
        const j = await this.service.getRowOrThrow(id);
        return {
          progress: j.progress,
          page: j.currentPage,
          total: j.totalPages,
          status: j.status,
        };
      });
    })();
  }
}
