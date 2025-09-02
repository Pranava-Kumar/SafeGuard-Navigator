from app.db.session import engine
from app.db.base import Base
from app.models.user import User
from app.models.report import Report
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    print("Initializing database tables...")
    try:
        # Import all models to ensure they are registered
        from app.models import user, report
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        
        # Verify tables were created
        from sqlalchemy import text
        with engine.connect() as connection:
            result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
            tables = [row[0] for row in result.fetchall()]
            print(f"Existing tables: {tables}")
            
            # Check users table structure
            if 'users' in tables:
                result = connection.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"))
                columns = result.fetchall()
                print("Users table columns:")
                for column in columns:
                    print(f"  - {column[0]} ({column[1]})")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        logger.error(f"Error creating database tables: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_db()