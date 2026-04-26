import { apiBase } from "./api-base";

const NO_REFRESH_ON_401 = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/refresh",
  "/auth/logout",
]);

function resolveUrl(path: string): string {
  if (/^https?:\/\//iu.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

function pathKeyFor401(path: string): string {
  let pathname = path;
  if (/^https?:\/\//iu.test(path)) {
    try {
      pathname = new URL(path).pathname;
    } catch {
      pathname = path;
    }
  }
  const q = pathname.indexOf("?");
  return q === -1 ? pathname : pathname.slice(0, q);
}

/**
 * Fetch к API с cookie; при 401 один раз вызывает POST /auth/refresh и повторяет запрос.
 */
export async function apiFetchAuthed(path: string, init?: RequestInit): Promise<Response> {
  const url = resolveUrl(path);
  const run = () => fetch(url, { credentials: "include", ...init });
  let r = await run();
  if (r.status !== 401) return r;
  if (NO_REFRESH_ON_401.has(pathKeyFor401(path))) return r;
  const ref = await fetch(`${apiBase()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!ref.ok) return r;
  return run();
}
