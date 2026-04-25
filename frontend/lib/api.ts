import type { OcrMode, OcrSettingsValue } from "@/features/ocr";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job {
  id: number;
  filename: string;
  status: JobStatus;
  progress: number;
  total_pages: number;
  current_page: number;
  language: string;
  optimize: number;
  deskew: boolean;
  mode: OcrMode;
  input_size: number;
  output_size: number;
  error?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface JobListResponse {
  items: Job[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** URL Fastify из браузера. Не `http://api:8000` (это имя хоста только внутри Docker), на хосте: `http://127.0.0.1:8000` */
function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/u, "")?.trim();
  return raw && raw.length > 0 ? raw : "http://127.0.0.1:8000";
}

export async function createJob(file: File, opts: OcrSettingsValue): Promise<Job> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("language", opts.language);
  fd.append("optimize", String(opts.optimize));
  fd.append("deskew", String(opts.deskew));
  fd.append("mode", opts.mode);
  const r = await fetch(`${apiBase()}/jobs`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function listJobs(params?: { page?: number; page_size?: number }): Promise<JobListResponse> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.page_size != null) sp.set("page_size", String(params.page_size));
  const q = sp.toString();
  const r = await fetch(`${apiBase()}/jobs${q ? `?${q}` : ""}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getJob(id: number): Promise<Job> {
  const r = await fetch(`${apiBase()}/jobs/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteJob(id: number): Promise<void> {
  const r = await fetch(`${apiBase()}/jobs/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
}

export function downloadUrl(id: number): string {
  return `${apiBase()}/jobs/${id}/download`;
}

export function streamUrl(id: number): string {
  return `${apiBase()}/jobs/${id}/stream`;
}
