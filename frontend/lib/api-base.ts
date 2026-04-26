/** URL Fastify из браузера. Не `http://api:8000` (только внутри Docker), на хосте: `http://127.0.0.1:8000` */
export function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/u, "")?.trim();
  return raw && raw.length > 0 ? raw : "http://127.0.0.1:8000";
}
