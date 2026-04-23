from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    status: JobStatus = Field(default=JobStatus.pending)
    progress: float = 0.0  # 0..1
    total_pages: int = 0
    current_page: int = 0
    language: str = "rus"
    optimize: int = 3
    deskew: bool = True
    mode: str = "skip_text"  # skip_text | force_ocr | redo_ocr
    input_path: str = ""
    output_path: str = ""
    input_size: int = 0
    output_size: int = 0
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
