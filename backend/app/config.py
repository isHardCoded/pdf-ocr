import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data")).resolve()
INPUT_DIR = DATA_DIR / "input"
OUTPUT_DIR = DATA_DIR / "output"
DB_PATH = DATA_DIR / "app.db"

for d in (DATA_DIR, INPUT_DIR, OUTPUT_DIR):
    d.mkdir(parents=True, exist_ok=True)
