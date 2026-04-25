import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    _app = Path(__file__).resolve().parent
    _root = _app.parents[1]  # корень репо: .../backend/app -> parents[0]=backend, [1]=repo
    p_root = _root / ".env"
    p_api = _root / "api" / ".env"
    if p_root.is_file():
        load_dotenv(p_root)
    if p_api.is_file():
        load_dotenv(p_api, override=True)
except ImportError:
    pass

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data")).resolve()
INPUT_DIR = DATA_DIR / "input"
OUTPUT_DIR = DATA_DIR / "output"


def _sqlalchemy_url() -> str:
    u = (os.environ.get("DATABASE_URL") or "").strip()
    if not u:
        u = "postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/pdf_ocr"
    elif u.startswith("postgres://") and "://" in u and not u.startswith("postgresql+psycopg"):
        u = u.replace("postgres://", "postgresql+psycopg2://", 1)
    elif u.startswith("postgresql://") and "psycopg" not in u.split("://", 1)[0]:
        u = u.replace("postgresql://", "postgresql+psycopg2://", 1)
    if "schema=public" in u:
        u = u.replace("?schema=public&", "?").replace("&schema=public", "").replace("?schema=public", "")
    u = u.rstrip("?&")
    return u


DATABASE_URL = _sqlalchemy_url()

for d in (DATA_DIR, INPUT_DIR, OUTPUT_DIR):
    d.mkdir(parents=True, exist_ok=True)
