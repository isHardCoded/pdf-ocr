import { JobRepository } from "../repositories/job.repository.js";
import { JobService } from "../services/job.service.js";
import { JobsController } from "../controllers/jobs.controller.js";
const jobRoutes = async (fastify) => {
    const controller = new JobsController(new JobService(new JobRepository()));
    fastify.get("/jobs", (req) => controller.list(req));
    fastify.post("/jobs", (req) => controller.create(req));
    fastify.get("/jobs/:job_id", (req) => controller.get(req));
    fastify.delete("/jobs/:job_id", (req) => controller.remove(req));
    fastify.get("/jobs/:job_id/download", (req, rep) => controller.download(req, rep));
    fastify.get("/jobs/:job_id/preview", (req, rep) => controller.preview(req, rep));
    fastify.get("/jobs/:job_id/stream", (req, rep) => controller.stream(req, rep));
};
export default jobRoutes;
