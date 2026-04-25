"""OCR worker: processes pending jobs from the shared SQLite DB (API creates rows; ocrmypdf does the work)."""
from __future__ import annotations

import logging
import time
from sqlmodel import Session, select

from . import config  # noqa: F401 — ensure DATA_DIR, input, output
from .db import engine, init_db
from .models import Job, JobStatus
from .services.ocr import run_ocr_sync

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def run_forever(poll_s: float = 1.0, on_error_s: float = 2.0) -> None:
    init_db()
    logger.info("OCR worker started, polling for pending jobs")
    while True:
        try:
            with Session(engine) as s:
                st = select(Job).where(Job.status == JobStatus.pending).order_by(Job.id)
                job = s.exec(st).first()
            if job is None:
                time.sleep(poll_s)
                continue
            if job.id is None:
                time.sleep(poll_s)
                continue
            jid = int(job.id)
            logger.info("Picked job %s: %s", jid, job.filename)
            run_ocr_sync(jid)
        except Exception:  # noqa: BLE001 — keep worker alive
            logger.exception("Worker loop error, backing off")
            time.sleep(on_error_s)


def main() -> None:
    run_forever()


if __name__ == "__main__":
    main()
