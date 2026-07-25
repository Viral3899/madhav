"""
database.py — SQLAlchemy engine, session factory, and Base
Database: SQLite (shopzone.db) stored next to this file
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# ── DB path ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "shopzone.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# ── Engine ─────────────────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # required for SQLite + FastAPI
    echo=False,   # set True to see SQL queries in console
)

# ── Session factory ────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Base class for all ORM models ──────────────────────────────────────────
class Base(DeclarativeBase):
    pass

# ── FastAPI dependency — yields a DB session per request ───────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
