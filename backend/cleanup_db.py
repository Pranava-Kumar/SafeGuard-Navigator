from app.db.session import engine
from sqlalchemy import text

def cleanup_db():
    print("Cleaning up database...")
    try:
        with engine.connect() as conn:
            # Drop the "User" table if it exists
            print("Dropping 'User' table if it exists...")
            conn.execute(text('DROP TABLE IF EXISTS "User" CASCADE'))
            
            # Commit the transaction
            conn.commit()
            
        print("Database cleanup completed successfully!")
    except Exception as e:
        print(f"Error during database cleanup: {e}")

if __name__ == "__main__":
    cleanup_db()