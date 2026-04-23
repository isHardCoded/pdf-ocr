from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .routes import jobs as jobs_routes
from .routes import stream as stream_routes
from .services import progress

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    progress.set_loop(asyncio.get_running_loop())
    yield


app = FastAPI(title="PDF OCR Converter", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_routes.router)
app.include_router(stream_routes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
