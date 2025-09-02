from app.db.session import engine
from sqlalchemy import text

def check_and_cleanup():
    print("Checking current tables...")
    try:
        with engine.connect() as conn:
            # List all tables
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result.fetchall()]
            print(f"Current tables: {tables}")
            
            # Check if both "User" and "users" tables exist
            if "User" in tables and "users" in tables:
                print("Both 'User' and 'users' tables exist. Dropping 'User' table...")
                conn.execute(text('DROP TABLE IF EXISTS "User" CASCADE'))
                print("'User' table dropped successfully!")
                
                # Verify the tables again
                result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
                tables = [row[0] for row in result.fetchall()]
                print(f"Tables after cleanup: {tables}")
            elif "User" in tables:
                print("Only 'User' table exists. Dropping it...")
                conn.execute(text('DROP TABLE IF EXISTS "User" CASCADE'))
                print("'User' table dropped successfully!")
                
                # Verify the tables again
                result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
                tables = [row[0] for row in result.fetchall()]
                print(f"Tables after cleanup: {tables}")
            else:
                print("No duplicate 'User' table found. Database is clean.")
                
    except Exception as e:
        print(f"Error during database check/cleanup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_and_cleanup()