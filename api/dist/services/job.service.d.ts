import type { MultipartFile, MultipartValue } from "@fastify/multipart";
import { Job } from "@prisma/client";
import { JobRepository } from "../repositories/job.repository.js";
type JobRow = Job;
type FormPart = MultipartFile | MultipartValue;
export declare class JobService {
    private readonly repo;
    constructor(repo: JobRepository);
    createFromMultipart(getParts: () => AsyncIterable<FormPart>): Promise<{
        id: number;
        filename: string;
        status: string;
        progress: number;
        language: string;
        optimize: number;
        deskew: boolean;
        mode: string;
        total_pages: number;
        current_page: number;
        input_size: number;
        output_size: number;
        created_at: string;
        error?: string | null | undefined;
        started_at?: string | null | undefined;
        completed_at?: string | null | undefined;
    }>;
    list(query: unknown): Promise<{
        items: {
            id: number;
            filename: string;
            status: string;
            progress: number;
            language: string;
            optimize: number;
            deskew: boolean;
            mode: string;
            total_pages: number;
            current_page: number;
            input_size: number;
            output_size: number;
            created_at: string;
            error?: string | null | undefined;
            started_at?: string | null | undefined;
            completed_at?: string | null | undefined;
        }[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>;
    listPaged(p: {
        page: number;
        page_size: number;
    }): Promise<{
        items: {
            id: number;
            filename: string;
            status: string;
            progress: number;
            language: string;
            optimize: number;
            deskew: boolean;
            mode: string;
            total_pages: number;
            current_page: number;
            input_size: number;
            output_size: number;
            created_at: string;
            error?: string | null | undefined;
            started_at?: string | null | undefined;
            completed_at?: string | null | undefined;
        }[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>;
    getById(id: number): Promise<{
        id: number;
        filename: string;
        status: string;
        progress: number;
        language: string;
        optimize: number;
        deskew: boolean;
        mode: string;
        total_pages: number;
        current_page: number;
        input_size: number;
        output_size: number;
        created_at: string;
        error?: string | null | undefined;
        started_at?: string | null | undefined;
        completed_at?: string | null | undefined;
    }>;
    deleteJob(id: number): Promise<void>;
    getRowOrThrow(id: number): Promise<JobRow>;
    getDownloadStream(row: JobRow): Promise<{
        stream: import("fs").ReadStream;
        downloadName: string;
    }>;
    getPreviewStream(row: JobRow): Promise<{
        stream: import("fs").ReadStream;
    }>;
}
export {};
