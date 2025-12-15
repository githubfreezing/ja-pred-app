# app/db/deps.py
from typing import Generator
from sqlalchemy.orm import Session

from app.db.session import SessionLocal

# FastAPI の Depends で呼ばれる DB セッション依存関数
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()