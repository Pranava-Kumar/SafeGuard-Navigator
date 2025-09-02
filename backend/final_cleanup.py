import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
from app.core.config import settings

def final_cleanup():
    try:
        print("Starting final database cleanup...")
        print(f"Using database URL: {settings.database_url}")
        
        # Create engine
        engine = create_engine(settings.database_url, echo=True)
        
        # Create a SessionLocal class
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create a new session
        db = SessionLocal()
        
        # List all tables before cleanup
        print("\nChecking current tables...")
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables_before = [row[0] for row in result.fetchall()]
        print(f"Tables before cleanup: {tables_before}")
        
        # Drop the "User" table if it exists
        if "User" in tables_before:
            print("\nDropping 'User' table...")
            db.execute(text('DROP TABLE IF EXISTS "User" CASCADE'))
            db.commit()
            print("'User' table dropped successfully!")
        else:
            print("\nNo 'User' table found to drop.")
        
        # List all tables after cleanup
        print("\nChecking tables after cleanup...")
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables_after = [row[0] for row in result.fetchall()]
        print(f"Tables after cleanup: {tables_after}")
        
        # Verify that we only have the correct tables
        expected_tables = {"users", "reports"}
        actual_tables = set(tables_after)
        
        if expected_tables.issubset(actual_tables):
            print("\nDatabase cleanup successful!")
            print(f"Found expected tables: {expected_tables}")
            if actual_tables != expected_tables:
                extra_tables = actual_tables - expected_tables
                print(f"Note: Found additional tables: {extra_tables}")
        else:
            missing_tables = expected_tables - actual_tables
            print(f"\nDatabase cleanup incomplete!")
            print(f"Missing expected tables: {missing_tables}")
        
        db.close()
        return True
    except Exception as e:
        print(f"Error during final database cleanup: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = final_cleanup()
    if success:
        print("\nFinal cleanup completed successfully!")
    else:
        print("\nFinal cleanup failed!")
    sys.exit(0 if success else 1)