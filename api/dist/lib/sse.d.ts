import type { FastifyReply, FastifyRequest } from "fastify";
export declare function formatSse(event: string, data: string): Buffer;
export declare function progressSse(request: FastifyRequest, reply: FastifyReply, getSnapshot: () => Promise<{
    progress: number;
    page: number;
    total: number;
    status: string;
}>): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
