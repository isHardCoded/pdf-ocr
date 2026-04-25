import { createReadStream } from "node:fs";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { AppError } from "../lib/app-error.js";
import { toJobOut } from "../mappers/job.mapper.js";
import { createJobFormSchema, listJobsQuerySchema } from "../schemas/job.zod.js";
import { inputDir, outputDir } from "../config/env.js";
function isFile(p) {
    return p.type === "file" && typeof p.toBuffer === "function";
}
function parsePdfJobFormFields(originalFilename, otherParts) {
    const body = {};
    for (const { fieldname, value } of otherParts) {
        if (fieldname)
            body[fieldname] = value;
    }
    if (body.deskew === undefined)
        body.deskew = "true";
    if (body.optimize === undefined)
        body.optimize = "3";
    if (body.language === undefined || !String(body.language).trim()) {
        body.language = "rus";
    }
    if (body.mode === undefined)
        body.mode = "skip_text";
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
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createFromMultipart(getParts) {
        let buffer = null;
        let fileFieldName = "";
        const other = [];
        for await (const part of getParts()) {
            if (isFile(part)) {
                if (part.fieldname === "file" && part.filename) {
                    buffer = await part.toBuffer();
                    fileFieldName = part.filename;
                }
                else {
                    await part.toBuffer().catch(() => { });
                }
                continue;
            }
            if (part.fieldname) {
                other.push({ fieldname: part.fieldname, value: String(part.value ?? "") });
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
    list(query) {
        const p = listJobsQuerySchema.parse(query);
        return this.listPaged(p);
    }
    async listPaged(p) {
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
    async getById(id) {
        const row = await this.repo.findById(id);
        if (!row) {
            throw new AppError(404, "Job not found", "not_found");
        }
        return toJobOut(row);
    }
    async deleteJob(id) {
        const row = await this.repo.findById(id);
        if (!row) {
            throw new AppError(404, "Job not found", "not_found");
        }
        for (const p of [row.inputPath, row.outputPath]) {
            if (!p)
                continue;
            try {
                await unlink(resolve(p));
            }
            catch {
                // best-effort
            }
        }
        await this.repo.remove(id);
    }
    async getRowOrThrow(id) {
        const row = await this.repo.findById(id);
        if (!row) {
            throw new AppError(404, "Job not found", "not_found");
        }
        return row;
    }
    async getDownloadStream(row) {
        if (row.status !== "completed") {
            throw new AppError(409, "Job is not completed", "not_ready");
        }
        const p = row.outputPath;
        try {
            await access(p);
        }
        catch {
            throw new AppError(410, "Output file missing", "gone");
        }
        return {
            stream: createReadStream(p),
            downloadName: `${basename(row.filename, extname(row.filename))}.ocr.pdf`,
        };
    }
    async getPreviewStream(row) {
        const p = row.outputPath;
        try {
            await access(p);
        }
        catch {
            throw new AppError(404, "Output not available yet", "no_output");
        }
        return { stream: createReadStream(p) };
    }
}
