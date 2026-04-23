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

const BASE = "/api";

export async function createJob(file: File, opts: OcrSettingsValue): Promise<Job> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("language", opts.language);
  fd.append("optimize", String(opts.optimize));
  fd.append("deskew", String(opts.deskew));
  fd.append("mode", opts.mode);
  const r = await fetch(`${BASE}/jobs`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function listJobs(params?: { page?: number; page_size?: number }): Promise<JobListResponse> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.page_size != null) sp.set("page_size", String(params.page_size));
  const q = sp.toString();
  const r = await fetch(`${BASE}/jobs${q ? `?${q}` : ""}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getJob(id: number): Promise<Job> {
  const r = await fetch(`${BASE}/jobs/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteJob(id: number): Promise<void> {
  const r = await fetch(`${BASE}/jobs/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
}

export function downloadUrl(id: number): string {
  return `${BASE}/jobs/${id}/download`;
}

export function streamUrl(id: number): string {
  return `${BASE}/jobs/${id}/stream`;
}
