import { NextRequest, NextResponse } from "next/server";

/** Server-side only; in Docker this must be the service name (e.g. http://backend:8000). */
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

  const init: RequestInit = {
    method: request.method,
    headers: h,
  };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    Object.assign(init, { body: request.body, duplex: "half" as const });
  }

  try {
    const res = await fetch(target, init);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch {
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
