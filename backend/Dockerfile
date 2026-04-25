# If docker.io fails (EOF on auth), pull base once manually or set in .env, e.g.:
#   BASE_IMAGE_DOCKER=registry.example.com/python:3.12-slim
#   docker compose build --build-arg BASE_IMAGE=${BASE_IMAGE_DOCKER}
ARG BASE_IMAGE=python:3.12-slim
FROM ${BASE_IMAGE}

# System deps for OCRmyPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-rus \
    tesseract-ocr-eng \
    ghostscript \
    pngquant \
    unpaper \
    qpdf \
    icc-profiles-free \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml /app/
RUN pip install --no-cache-dir "ocrmypdf>=16.0.0" "sqlmodel==0.0.22" "psycopg2-binary>=2.9.9" "python-dotenv>=1.0.0"

COPY app /app/app

ENV PYTHONUNBUFFERED=1
ENV DATA_DIR=/data

# Standalone worker (API is Node/Prisma; shared SQLite and files in DATA_DIR)
CMD ["python", "-m", "app.worker"]
