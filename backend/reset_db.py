from app.db.session import engine
from app.db.base import Base
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_db():
    print("Resetting database...")
    try:
        # Drop all tables
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables
        print("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        
        print("Database reset successfully!")
    except Exception as e:
        print(f"Error resetting database: {e}")
        logger.error(f"Error resetting database: {e}")

if __name__ == "__main__":
    reset_db()