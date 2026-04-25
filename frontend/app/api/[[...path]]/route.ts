import { NextRequest, NextResponse } from "next/server";

/** Server-side only; in Docker this must be the service name (e.g. http://api:8000). */
const backendBase = () =>
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(
    /\/$/u,
    ""
  );

async function proxy(request: NextRequest) {
  const incoming = new URL(request.url);
  const sub = incoming.pathname.replace(/^\/api\/?/u, "");
  const base = backendBase().replace(/\/$/u, "") + "/";
  const target = new URL((sub || "") + (incoming.search || ""), base).toString();

  const h = new Headers(request.headers);
  h.delete("host");
  h.delete("connection");

  const method = request.method;
  const init: RequestInit = {
    method: request.method,
    headers: h,
  };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    Object.assign(init, { body: request.body, duplex: "half" as const });
  }

  // POST (upload) — без лимита. GET /stream, /download, /preview — долгие. Остальные GET/DELETE/HEAD — 60s
  const aborter = new AbortController();
  const longRunningGet = /\/(stream|download|preview)(?:\?|$)/.test(incoming.pathname);
  const withTimeout =
    !longRunningGet && (method === "GET" || method === "DELETE" || method === "HEAD");
  const timer: ReturnType<typeof setTimeout> | null = withTimeout
    ? setTimeout(() => {
        aborter.abort();
      }, 60_000)
    : null;
  try {
    const res = await fetch(target, { ...init, signal: aborter.signal });
    if (timer) clearTimeout(timer);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch {
    if (timer) clearTimeout(timer);
    return new NextResponse("Backend is unavailable. Check that the API is running and BACKEND_URL is set in Docker.", {
      status: 502,
    });
  }
}

export const dynamic = "force-dynamic";

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const OPTIONS = proxy;
