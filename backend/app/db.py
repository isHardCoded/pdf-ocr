from sqlmodel import Session, SQLModel, create_engine

from .config import DB_PATH

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    from . import models  # noqa: F401 ensure tables are registered

    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    return Session(engine)
