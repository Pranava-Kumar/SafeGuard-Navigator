import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
from app.core.config import settings

def test_connection():
    try:
        print(f"Using database URL: {settings.database_url}")
        
        # Create engine
        engine = create_engine(settings.database_url, echo=True)
        
        # Create a SessionLocal class
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create a new session
        db = SessionLocal()
        
        # Try to execute a simple query
        result = db.execute(text("SELECT version();"))
        version = result.fetchone()
        print(f"Database version: {version[0]}")
        
        # List tables
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
        tables = result.fetchall()
        print("Tables in the database:")
        for table in tables:
            print(f"  - {table[0]}")
            
        # Check if 'users' table exists and its structure
        result = db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"))
        columns = result.fetchall()
        print("\nColumns in 'users' table:")
        if columns:
            for column in columns:
                print(f"  - {column[0]} ({column[1]})")
        else:
            print("  - Table 'users' does not exist or has no columns")
            
        db.close()
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_connection()