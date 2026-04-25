import { progressSse } from "../lib/sse.js";
import { AppError } from "../lib/app-error.js";
const jobIdParam = (p) => {
    const id = Number(p["job_id"]);
    if (!Number.isFinite(id)) {
        throw new AppError(400, "Invalid job id", "bad_id");
    }
    return id;
};
export class JobsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(request) {
        return this.service.createFromMultipart(() => request.parts());
    }
    list(request) {
        return this.service.list(request.query);
    }
    get(request) {
        return this.service.getById(jobIdParam(request.params));
    }
    async remove(request) {
        await this.service.deleteJob(jobIdParam(request.params));
        return { ok: true };
    }
    async download(request, reply) {
        const id = jobIdParam(request.params);
        const row = await this.service.getRowOrThrow(id);
        const { stream, downloadName } = await this.service.getDownloadStream(row);
        return reply
            .header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`)
            .type("application/pdf")
            .send(stream);
    }
    async preview(request, reply) {
        const id = jobIdParam(request.params);
        const row = await this.service.getRowOrThrow(id);
        const { stream } = await this.service.getPreviewStream(row);
        return reply.type("application/pdf").send(stream);
    }
    stream(request, reply) {
        const id = jobIdParam(request.params);
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
