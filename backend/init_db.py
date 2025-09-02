import os
import sys
from sqlalchemy import create_engine
from app.db.base import Base
from app.db.session import engine

def init_db():
    print("Initializing database...")
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()