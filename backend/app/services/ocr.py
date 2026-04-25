"""OCR engine: ocrmypdf; progress in PostgreSQL (optional in-process queue, unused by Node API)."""
from __future__ import annotations

import contextvars
import logging
import os
from datetime import datetime
from pathlib import Path

import ocrmypdf
from ocrmypdf import hookimpl
from sqlmodel import Session

from ..db import engine
from ..models import Job, JobStatus
from . import progress

logger = logging.getLogger(__name__)

# Current job id seen by the progress bar plugin (set in worker thread).
_current_job_id: contextvars.ContextVar[int | None] = contextvars.ContextVar(
    "_current_job_id", default=None
)


class ProgressTracker:
    """Drop-in replacement for ocrmypdf's tqdm progress bar.

    ocrmypdf instantiates the class per-phase with total/desc/unit kwargs.
    We forward page-level updates to the queue and to the DB.
    """

    def __init__(self, *args, **kwargs):
        self.job_id = _current_job_id.get()
        self.total = kwargs.get("total") or 0
        self.desc = kwargs.get("desc") or ""
        self.unit = kwargs.get("unit") or ""
        self.n = 0
        self.disable = kwargs.get("disable", False)

    def __enter__(self):
        if self.job_id is not None:
            progress.publish_threadsafe(
                self.job_id,
                {
                    "phase": self.desc or "processing",
                    "total": self.total,
                    "page": 0,
                    "progress": 0.0,
                },
            )
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def update(self, n: int = 1, **_kwargs) -> None:
        self.n += n
        if self.job_id is None:
            return
        frac = (self.n / self.total) if self.total else 0.0
        progress.publish_threadsafe(
            self.job_id,
            {
                "phase": self.desc or "processing",
                "total": self.total,
                "page": self.n,
                "progress": frac,
            },
        )
        try:
            with Session(engine) as s:
                job = s.get(Job, self.job_id)
                if job:
                    if self.total:
                        job.total_pages = max(job.total_pages, self.total)
                    job.current_page = self.n
                    job.progress = frac
                    s.add(job)
                    s.commit()
        except Exception:
            logger.exception("progress db update failed")

    def close(self) -> None:
        pass


# --- OCRmyPDF plugin entrypoint (module-level hookimpl). ---
@hookimpl
def get_progressbar_class():  # noqa: D401
    return ProgressTracker


def run_ocr_sync(job_id: int) -> None:
    """Run OCR synchronously (meant to be called in a worker thread)."""
    with Session(engine) as s:
        job = s.get(Job, job_id)
        if job is None:
            return
        job.status = JobStatus.running
        job.started_at = datetime.utcnow()
        s.add(job)
        s.commit()
        params = {
            "input_file": job.input_path,
            "output_file": job.output_path,
            "language": job.language,
            "optimize": job.optimize,
            "deskew": job.deskew,
            "mode": job.mode,
        }

    token = _current_job_id.set(job_id)
    try:
        kwargs = {
            "language": params["language"],
            "jobs": max(1, os.cpu_count() or 1),
            "output_type": "pdfa",
            "optimize": params["optimize"],
            "deskew": params["deskew"],
            "plugins": ["app.services.ocr"],
            "use_threads": True,
        }
        # skip_text: skip pages that ocrmypdf considers to already have text. Mixed or
        # noisy PDFs often get most pages “skipped” (no new OCR) while one image-only
        # page is recognized — use force_ocr for full scans. See OcrSettings help text.
        mode = params["mode"]
        if mode == "force_ocr":
            kwargs["force_ocr"] = True
        elif mode == "redo_ocr":
            kwargs["redo_ocr"] = True
        else:
            kwargs["skip_text"] = True

        progress.publish_threadsafe(
            job_id, {"phase": "starting", "progress": 0.0, "page": 0}
        )
        ocrmypdf.ocr(params["input_file"], params["output_file"], **kwargs)

        out_size = Path(params["output_file"]).stat().st_size
        with Session(engine) as s:
            job = s.get(Job, job_id)
            if job:
                job.status = JobStatus.completed
                job.progress = 1.0
                job.completed_at = datetime.utcnow()
                job.output_size = out_size
                s.add(job)
                s.commit()
        progress.publish_threadsafe(
            job_id, {"phase": "done", "progress": 1.0, "status": "completed"}
        )
    except Exception as e:
        logger.exception("OCR failed for job %s", job_id)
        with Session(engine) as s:
            job = s.get(Job, job_id)
            if job:
                job.status = JobStatus.failed
                job.error = str(e)
                job.completed_at = datetime.utcnow()
                s.add(job)
                s.commit()
        progress.publish_threadsafe(
            job_id,
            {"phase": "error", "status": "failed", "error": str(e)},
        )
    finally:
        _current_job_id.reset(token)
