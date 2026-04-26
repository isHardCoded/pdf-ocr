import type { FastifyRequest, FastifyReply } from "fastify";
import { JobService, type JobOwnerContext } from "../services/job.service.js";
import { progressSse } from "../lib/sse.js";
import { AppError } from "../lib/app-error.js";

function ownerFromRequest(request: FastifyRequest): JobOwnerContext {
  if (!request.user) return null;
  return { id: request.user.id };
}

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
    return this.service.createFromMultipart(() => request.parts(), ownerFromRequest(request));
  }

  list(request: FastifyRequest) {
    return this.service.list(request.query, ownerFromRequest(request));
  }

  get(request: FastifyRequest) {
    return this.service.getById(jobIdParam(request.params as { job_id: string }), ownerFromRequest(request));
  }

  async remove(request: FastifyRequest) {
    await this.service.deleteJob(jobIdParam(request.params as { job_id: string }), ownerFromRequest(request));
    return { ok: true } as const;
  }

  async download(request: FastifyRequest, reply: FastifyReply) {
    const id = jobIdParam(request.params as { job_id: string });
    const row = await this.service.getRowOrThrow(id, ownerFromRequest(request));
    const { stream, downloadName } = await this.service.getDownloadStream(row);
    return reply
      .header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`)
      .type("application/pdf")
      .send(stream);
  }

  async preview(request: FastifyRequest, reply: FastifyReply) {
    const id = jobIdParam(request.params as { job_id: string });
    const row = await this.service.getRowOrThrow(id, ownerFromRequest(request));
    const { stream } = await this.service.getPreviewStream(row);
    return reply.type("application/pdf").send(stream);
  }

  stream(request: FastifyRequest, reply: FastifyReply) {
    const id = jobIdParam(request.params as { job_id: string });
    const owner = ownerFromRequest(request);
    return (async () => {
      await this.service.getRowOrThrow(id, owner);
      return progressSse(request, reply, async () => {
        const j = await this.service.getRowOrThrow(id, owner);
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
