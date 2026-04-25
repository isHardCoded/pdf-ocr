import type { FastifyRequest, FastifyReply } from "fastify";
import { JobService } from "../services/job.service.js";
export declare class JobsController {
    private readonly service;
    constructor(service: JobService);
    create(request: FastifyRequest): Promise<{
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
    list(request: FastifyRequest): Promise<{
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
    get(request: FastifyRequest): Promise<{
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
    remove(request: FastifyRequest): Promise<{
        readonly ok: true;
    }>;
    download(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    preview(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    stream(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
