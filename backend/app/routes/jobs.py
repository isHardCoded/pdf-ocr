from __future__ import annotations

import asyncio
import uuid
from datetime import datetime
from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlmodel import Session, select

from ..config import INPUT_DIR, OUTPUT_DIR
from ..db import engine
from ..models import Job, JobStatus
from ..services.ocr import run_ocr

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobOut(BaseModel):
    id: int
    filename: str
    status: str
    progress: float
    total_pages: int
    current_page: int
    language: str
    optimize: int
    deskew: bool
    mode: str
    input_size: int
    output_size: int
    error: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    @classmethod
    def from_job(cls, j: Job) -> "JobOut":
        return cls(
            id=j.id or 0,
            filename=j.filename,
            status=j.status.value if isinstance(j.status, JobStatus) else str(j.status),
            progress=j.progress,
            total_pages=j.total_pages,
            current_page=j.current_page,
            language=j.language,
            optimize=j.optimize,
            deskew=j.deskew,
            mode=j.mode,
            input_size=j.input_size,
            output_size=j.output_size,
            error=j.error,
            created_at=j.created_at,
            started_at=j.started_at,
            completed_at=j.completed_at,
        )


@router.post("", response_model=JobOut)
async def create_job(
    file: UploadFile = File(...),
    language: str = Form("rus"),
    optimize: int = Form(3),
    deskew: bool = Form(True),
    mode: Literal["skip_text", "force_ocr", "redo_ocr"] = Form("skip_text"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only .pdf files are accepted")

    uid = uuid.uuid4().hex
    in_path = INPUT_DIR / f"{uid}__{file.filename}"
    out_name = Path(file.filename).stem + ".ocr.pdf"
    out_path = OUTPUT_DIR / f"{uid}__{out_name}"

    size = 0
    with in_path.open("wb") as f:
        while chunk := await file.read(1024 * 1024):
            f.write(chunk)
            size += len(chunk)

    with Session(engine) as s:
        job = Job(
            filename=file.filename,
            status=JobStatus.pending,
            language=language,
            optimize=optimize,
            deskew=deskew,
            mode=mode,
            input_path=str(in_path),
            output_path=str(out_path),
            input_size=size,
        )
        s.add(job)
        s.commit()
        s.refresh(job)
        job_id = job.id
        out = JobOut.from_job(job)

    asyncio.create_task(run_ocr(job_id))
    return out


@router.get("", response_model=list[JobOut])
def list_jobs():
    with Session(engine) as s:
        jobs = s.exec(select(Job).order_by(Job.created_at.desc())).all()
        return [JobOut.from_job(j) for j in jobs]


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int):
    with Session(engine) as s:
        j = s.get(Job, job_id)
        if not j:
            raise HTTPException(404, "Job not found")
        return JobOut.from_job(j)


@router.delete("/{job_id}")
def delete_job(job_id: int):
    with Session(engine) as s:
        j = s.get(Job, job_id)
        if not j:
            raise HTTPException(404, "Job not found")
        for p in (j.input_path, j.output_path):
            try:
                if p:
                    Path(p).unlink(missing_ok=True)
            except Exception:
                pass
        s.delete(j)
        s.commit()
    return {"ok": True}


@router.get("/{job_id}/download")
def download(job_id: int):
    with Session(engine) as s:
        j = s.get(Job, job_id)
        if not j:
            raise HTTPException(404, "Job not found")
        if j.status != JobStatus.completed:
            raise HTTPException(409, "Job is not completed")
        out = Path(j.output_path)
        if not out.exists():
            raise HTTPException(410, "Output file missing")
        download_name = Path(j.filename).stem + ".ocr.pdf"
        return FileResponse(
            path=str(out),
            media_type="application/pdf",
            filename=download_name,
        )


@router.get("/{job_id}/preview")
def preview(job_id: int):
    """Inline view of the output PDF (for react-pdf)."""
    with Session(engine) as s:
        j = s.get(Job, job_id)
        if not j:
            raise HTTPException(404, "Job not found")
        out = Path(j.output_path)
        if not out.exists():
            raise HTTPException(404, "Output not available yet")
        return FileResponse(path=str(out), media_type="application/pdf")
