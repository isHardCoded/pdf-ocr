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
  mode: "skip_text" | "force_ocr" | "redo_ocr";
  input_size: number;
  output_size: number;
  error?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

// In the browser all requests go through Next's rewrite at /api/*
const BASE = "/api";

export async function createJob(
  file: File,
  opts: {
    language: string;
    optimize: number;
    deskew: boolean;
    mode: "skip_text" | "force_ocr" | "redo_ocr";
  }
): Promise<Job> {
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

export async function listJobs(): Promise<Job[]> {
  const r = await fetch(`${BASE}/jobs`, { cache: "no-store" });
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

export function previewUrl(id: number): string {
  return `${BASE}/jobs/${id}/preview`;
}

export function streamUrl(id: number): string {
  return `${BASE}/jobs/${id}/stream`;
}
