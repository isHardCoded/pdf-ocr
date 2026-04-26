import { apiBase } from "./api-base";
import { apiFetchAuthed } from "./api-auth-fetch";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  emailVerified: boolean;
};

export type AccountActivityKind = "create" | "complete" | "failed";

export type AccountSummary = {
  user: {
    fullName: string;
    email: string;
    emailVerified: boolean;
    memberSince: string;
  };
  stats: {
    tasksTotal: number;
    pagesProcessed: number;
    storageBytes: number;
    lastJobAt: string | null;
  };
  activity: Array<{
    id: string;
    at: string;
    kind: AccountActivityKind;
    action: string;
    detail: string;
  }>;
};

type ApiErr = { error?: string; code?: string };

async function readApiError(r: Response): Promise<string> {
  const t = await r.text();
  try {
    const j = JSON.parse(t) as ApiErr;
    if (typeof j.error === "string") return j.error;
  } catch {
    // ignore
  }
  return t || r.statusText;
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await apiFetchAuthed(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(await readApiError(r));
  return r.json() as Promise<T>;
}

export async function registerAccount(body: {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<{ ok: true; email: string; mockEmailCode: string }> {
  return jsonFetch("/auth/register", { method: "POST", body: JSON.stringify(body) });
}

export async function verifyEmail(body: { email: string; code: string }): Promise<{ ok: true }> {
  return jsonFetch("/auth/verify-email", { method: "POST", body: JSON.stringify(body) });
}

export async function login(body: { email: string; password: string }): Promise<{ ok: true; user: AuthUser }> {
  return jsonFetch("/auth/login", { method: "POST", body: JSON.stringify(body) });
}

export async function logout(): Promise<void> {
  await jsonFetch("/auth/logout", { method: "POST", body: "{}" });
}

export async function fetchMe(): Promise<{ user: AuthUser } | null> {
  const r = await apiFetchAuthed("/auth/me", { cache: "no-store" });
  if (r.status === 401) return null;
  if (!r.ok) throw new Error(await readApiError(r));
  return r.json() as Promise<{ user: AuthUser }>;
}

export async function fetchAccountSummary(): Promise<AccountSummary> {
  return jsonFetch("/account/summary", { method: "GET" });
}
