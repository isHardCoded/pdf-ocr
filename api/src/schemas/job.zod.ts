import { z } from "zod";

export const ocrModeSchema = z.enum(["skip_text", "force_ocr", "redo_ocr"]);

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(12),
});

export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;

const isoDate = z
  .union([z.string().datetime(), z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString() : typeof v === "string" ? v : String(v)));

export const jobOutSchema = z.object({
  id: z.number().int(),
  filename: z.string(),
  status: z.string(),
  progress: z.number(),
  total_pages: z.number().int(),
  current_page: z.number().int(),
  language: z.string(),
  optimize: z.number().int(),
  deskew: z.boolean(),
  mode: z.string(),
  input_size: z.number().int(),
  output_size: z.number().int(),
  error: z.string().nullable().optional(),
  created_at: isoDate,
  started_at: z.union([isoDate, z.null()]).optional(),
  completed_at: z.union([isoDate, z.null()]).optional(),
});

export type JobOut = z.infer<typeof jobOutSchema>;

export const jobListOutSchema = z.object({
  items: z.array(jobOutSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
  total_pages: z.number().int(),
});

export type JobListOut = z.infer<typeof jobListOutSchema>;

const formBool = z.preprocess(
  (v) => {
    if (v === undefined || v === null || v === "") return true;
    if (v === "true" || v === true || v === 1 || v === "1") return true;
    if (v === "false" || v === false || v === 0 || v === "0") return false;
    return v;
  },
  z.boolean()
);

export const createJobFormSchema = z.object({
  language: z.string().min(1).default("rus"),
  optimize: z.coerce.number().int().min(0).max(3).default(3),
  deskew: formBool.default(true),
  mode: ocrModeSchema.default("skip_text"),
});
