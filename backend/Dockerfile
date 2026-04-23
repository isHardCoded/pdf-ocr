FROM mirror.gcr.io/library/python:3.12-slim

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
RUN pip install --no-cache-dir \
    "ocrmypdf>=16.0.0" \
    fastapi==0.115.0 \
    "uvicorn[standard]==0.30.6" \
    sqlmodel==0.0.22 \
    python-multipart==0.0.12 \
    sse-starlette==2.1.3 \
    aiofiles==24.1.0

COPY app /app/app

ENV PYTHONUNBUFFERED=1
ENV DATA_DIR=/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
