import type { Job } from "@prisma/client";
import type { JobOut } from "../schemas/job.zod.js";
export declare function toJobOut(row: Job): JobOut;
