import { createReadStream } from "node:fs";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { MultipartFile, MultipartValue } from "@fastify/multipart";
import { Job } from "@prisma/client";
import { AppError } from "../lib/app-error.js";
import { toJobOut } from "../mappers/job.mapper.js";
import { createJobFormSchema, listJobsQuerySchema, type ListJobsQuery } from "../schemas/job.zod.js";
import { JobRepository } from "../repositories/job.repository.js";
import { inputDir, outputDir } from "../config/env.js";

type JobRow = Job;

type FormPart = MultipartFile | MultipartValue;

function isFile(p: FormPart): p is MultipartFile {
  return (p as MultipartFile).type === "file" && typeof (p as MultipartFile).toBuffer === "function";
}

function parsePdfJobFormFields(
  originalFilename: string,
  otherParts: { fieldname: string; value: string }[]
) {
  const body: Record<string, string> = {};
  for (const { fieldname, value } of otherParts) {
    if (fieldname) body[fieldname] = value;
  }
  if (body.deskew === undefined) body.deskew = "true";
  if (body.optimize === undefined) body.optimize = "3";
  if (body.language === undefined || !String(body.language).trim()) {
    body.language = "rus";
  }
  if (body.mode === undefined) body.mode = "skip_text";

  if (!originalFilename || !originalFilename.toLowerCase().endsWith(".pdf")) {
    throw new AppError(400, "Only .pdf files are accepted", "invalid_file");
  }

  const safe = createJobFormSchema.safeParse({
    language: body.language,
    optimize: body.optimize,
    deskew: body.deskew,
    mode: body.mode,
  });
  if (!safe.success) {
    const msg = safe.error.flatten();
    throw new AppError(400, `Invalid form: ${JSON.stringify(msg)}`, "invalid_form");
  }
  return { fields: safe.data, filename: originalFilename };
}

export class JobService {
  constructor(private readonly repo: JobRepository) {}

  async createFromMultipart(
    getParts: () => AsyncIterable<FormPart>
  ) {
    let buffer: Buffer | null = null;
    let fileFieldName = "";
    const other: { fieldname: string; value: string }[] = [];

    for await (const part of getParts()) {
      if (isFile(part)) {
        if (part.fieldname === "file" && part.filename) {
          buffer = await part.toBuffer();
          fileFieldName = part.filename;
        } else {
          await (part as MultipartFile).toBuffer().catch(() => {});
        }
        continue;
      }
      if (part.fieldname) {
        other.push({ fieldname: part.fieldname, value: String((part as MultipartValue).value ?? "") });
      }
    }

    if (!buffer || !fileFieldName) {
      throw new AppError(400, "Missing file field 'file'", "missing_file");
    }

    const { fields, filename: originalName } = parsePdfJobFormFields(fileFieldName, other);
    const uid = randomUUID().replace(/-/g, "");
    const inName = `${uid}__${originalName}`;
    const inPath = join(inputDir(), inName);
    const outName = `${uid}__${basename(originalName, extname(originalName))}.ocr.pdf`;
    const outPath = join(outputDir(), outName);

    await mkdir(inputDir(), { recursive: true });
    await mkdir(outputDir(), { recursive: true });
    await writeFile(inPath, buffer, { mode: 0o644 });
    const inputSize = buffer.length;

    const now = new Date();
    const row = await this.repo.create({
      filename: originalName,
      status: "pending",
      progress: 0,
      totalPages: 0,
      currentPage: 0,
      language: fields.language,
      optimize: fields.optimize,
      deskew: fields.deskew,
      mode: fields.mode,
      inputPath: inPath,
      outputPath: outPath,
      inputSize,
      outputSize: 0,
      createdAt: now,
    });

    return toJobOut(row);
  }

  list(query: unknown) {
    const p: ListJobsQuery = listJobsQuerySchema.parse(query);
    return this.listPaged(p);
  }

  async listPaged(p: { page: number; page_size: number }) {
    const { rows, total } = await this.repo.list({
      page: p.page,
      pageSize: p.page_size,
    });
    const totalPages = total ? Math.ceil(total / p.page_size) : 0;
    return {
      items: rows.map(toJobOut),
      total,
      page: p.page,
      page_size: p.page_size,
      total_pages: totalPages,
    };
  }

  async getById(id: number) {
    const row = await this.repo.findById(id);
    if (!row) {
      throw new AppError(404, "Job not found", "not_found");
    }
    return toJobOut(row);
  }

  async deleteJob(id: number) {
    const row = await this.repo.findById(id);
    if (!row) {
      throw new AppError(404, "Job not found", "not_found");
    }
    for (const p of [row.inputPath, row.outputPath]) {
      if (!p) continue;
      try {
        await unlink(resolve(p));
      } catch {
        // best-effort
      }
    }
    await this.repo.remove(id);
  }

  async getRowOrThrow(id: number): Promise<JobRow> {
    const row = await this.repo.findById(id);
    if (!row) {
      throw new AppError(404, "Job not found", "not_found");
    }
    return row;
  }

  async getDownloadStream(row: JobRow) {
    if (row.status !== "completed") {
      throw new AppError(409, "Job is not completed", "not_ready");
    }
    const p = row.outputPath;
    try {
      await access(p);
    } catch {
      throw new AppError(410, "Output file missing", "gone");
    }
    return {
      stream: createReadStream(p),
      downloadName: `${basename(row.filename, extname(row.filename))}.ocr.pdf`,
    };
  }

  async getPreviewStream(row: JobRow) {
    const p = row.outputPath;
    try {
      await access(p);
    } catch {
      throw new AppError(404, "Output not available yet", "no_output");
    }
    return { stream: createReadStream(p) };
  }
}
