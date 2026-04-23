"""Per-job progress event broker.

Each job has an asyncio Queue of events; SSE endpoint drains it.
Because OCR runs in a worker thread, we use a thread-safe put that
schedules into the asyncio loop.
"""
from __future__ import annotations

import asyncio
from typing import Any, Dict

# job_id -> (asyncio.Queue, loop)
_queues: Dict[int, asyncio.Queue] = {}
_loop: asyncio.AbstractEventLoop | None = None


def set_loop(loop: asyncio.AbstractEventLoop) -> None:
    global _loop
    _loop = loop


def register(job_id: int) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _queues[job_id] = q
    return q


def unregister(job_id: int) -> None:
    _queues.pop(job_id, None)


def get(job_id: int) -> asyncio.Queue | None:
    return _queues.get(job_id)


def publish_threadsafe(job_id: int, event: Dict[str, Any]) -> None:
    """Publish an event from any thread."""
    q = _queues.get(job_id)
    if q is None or _loop is None:
        return
    try:
        _loop.call_soon_threadsafe(q.put_nowait, event)
    except RuntimeError:
        pass
