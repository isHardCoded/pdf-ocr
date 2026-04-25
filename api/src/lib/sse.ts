import { Readable } from "node:stream";
import type { FastifyReply, FastifyRequest } from "fastify";

const LINE_BREAK = /[\r\n\u2028\u2029]/g;

export function formatSse(event: string, data: string): Buffer {
  const clean = data.replace(LINE_BREAK, " ");
  return Buffer.from(`event: ${event}\ndata: ${clean}\n\n`, "utf-8");
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function progressSse(
  request: FastifyRequest,
  reply: FastifyReply,
  getSnapshot: () => Promise<{
    progress: number;
    page: number;
    total: number;
    status: string;
  }>
) {
  const ac = new AbortController();
  const onEnd = () => {
    ac.abort();
  };
  request.raw.on("close", onEnd);
  request.raw.on("aborted", onEnd);

  async function* g() {
    if (ac.signal.aborted) return;
    const initial = await getSnapshot();
    yield formatSse(
      "progress",
      JSON.stringify({
        phase: "snapshot",
        progress: initial.progress,
        page: initial.page,
        total: initial.total,
        status: initial.status,
      })
    );
    if (ac.signal.aborted) return;
    if (initial.status === "completed" || initial.status === "failed") {
      return;
    }

    while (true) {
      await sleep(1000);
      if (ac.signal.aborted) return;
      const cur = await getSnapshot();
      if (ac.signal.aborted) return;
      yield formatSse(
        "progress",
        JSON.stringify({
          phase: "poll",
          progress: cur.progress,
          page: cur.page,
          total: cur.total,
          status: cur.status,
        })
      );
      if (cur.status === "completed" || cur.status === "failed") {
        return;
      }
    }
  }

  const stream = Readable.from(g());
  stream.on("end", onEnd);
  return reply
    .header("Cache-Control", "no-cache, no-transform")
    .header("Connection", "keep-alive")
    .type("text/event-stream; charset=utf-8")
    .send(stream);
}
