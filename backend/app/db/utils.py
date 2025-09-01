from app.db.session import SessionLocal
from contextlib import contextmanager


# Dependency to get DB session
@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()