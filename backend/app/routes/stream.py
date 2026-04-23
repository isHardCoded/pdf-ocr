from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, HTTPException
from sqlmodel import Session
from sse_starlette.sse import EventSourceResponse

from ..db import engine
from ..models import Job, JobStatus
from ..services import progress

router = APIRouter(prefix="/jobs", tags=["stream"])


@router.get("/{job_id}/stream")
async def stream(job_id: int):
    with Session(engine) as s:
        j = s.get(Job, job_id)
        if not j:
            raise HTTPException(404, "Job not found")
        initial = {
            "phase": "snapshot",
            "progress": j.progress,
            "page": j.current_page,
            "total": j.total_pages,
            "status": j.status.value if isinstance(j.status, JobStatus) else str(j.status),
        }

    q = progress.get(job_id)

    async def gen():
        yield {"event": "progress", "data": json.dumps(initial)}

        if initial["status"] in ("completed", "failed"):
            return

        if q is None:
            # Fallback: poll DB until terminal state
            while True:
                await asyncio.sleep(1.0)
                with Session(engine) as s:
                    j = s.get(Job, job_id)
                    if not j:
                        return
                    payload = {
                        "phase": "poll",
                        "progress": j.progress,
                        "page": j.current_page,
                        "total": j.total_pages,
                        "status": j.status.value,
                    }
                    yield {"event": "progress", "data": json.dumps(payload)}
                    if j.status in (JobStatus.completed, JobStatus.failed):
                        return

        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=15.0)
            except asyncio.TimeoutError:
                yield {"event": "ping", "data": "{}"}
                continue
            yield {"event": "progress", "data": json.dumps(event)}
            if event.get("status") in ("completed", "failed"):
                return

    return EventSourceResponse(gen())
