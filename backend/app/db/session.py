import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL

if "postgresql" in db_url:
    try:
        temp_engine = create_engine(db_url, pool_pre_ping=True)
        with temp_engine.connect() as conn:
            pass
    except Exception as e:
        print(f"Notice: PostgreSQL connection unavailable ({e}). Using persistent SQLite fallback.")
        db_url = "sqlite:///./sql_app.db"

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if "sqlite" in db_url else {},
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
