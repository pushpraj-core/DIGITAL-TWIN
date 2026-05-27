"""
SQLAlchemy async engine, session factory, and declarative Base.

The application works entirely in-memory / file-based for now.
When a real PostgreSQL/PostGIS database is available, just update
DATABASE_URL in .env and everything wires up automatically.
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import DATABASE_URL

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def get_session() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency – yields an async session and closes it afterwards."""
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    """Create all tables (no-op when running file-based)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
