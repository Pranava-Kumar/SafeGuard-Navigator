import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def verify_database():
    try:
        print(f"Connecting to database: {settings.database_url}")
        
        # Create engine
        engine = create_engine(settings.database_url, echo=False)
        
        # Create a new connection
        with engine.connect() as connection:
            # List all tables
            result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
            tables = [row[0] for row in result.fetchall()]
            print(f"Existing tables: {tables}")
            
            # Check if users table exists
            if 'users' in tables:
                print("\nUsers table exists. Checking structure...")
                
                # Get all columns in users table
                result = connection.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"))
                columns = result.fetchall()
                
                print("Users table columns:")
                for column in columns:
                    print(f"  - {column[0]} ({column[1]})")
                    
                # Check specifically for date_of_birth column
                date_of_birth_exists = any(column[0] == 'date_of_birth' for column in columns)
                print(f"\nDate of birth column exists: {date_of_birth_exists}")
                
                if not date_of_birth_exists:
                    print("Adding missing date_of_birth column...")
                    connection.execute(text("ALTER TABLE users ADD COLUMN date_of_birth TIMESTAMP;"))
                    print("Date of birth column added successfully!")
                    
                # Check for other potentially missing columns
                expected_columns = ['date_of_birth', 'gender', 'avatar', 'language', 'timezone', 'city', 'state', 'country']
                missing_columns = [col for col in expected_columns if not any(column[0] == col for column in columns)]
                
                if missing_columns:
                    print(f"Adding missing columns: {missing_columns}")
                    for column in missing_columns:
                        if column in ['language', 'timezone']:
                            connection.execute(text(f"ALTER TABLE users ADD COLUMN {column} VARCHAR DEFAULT 'ENGLISH';"))
                        elif column == 'country':
                            connection.execute(text(f"ALTER TABLE users ADD COLUMN {column} VARCHAR DEFAULT 'India';"))
                        else:
                            connection.execute(text(f"ALTER TABLE users ADD COLUMN {column} VARCHAR;"))
                    print("All missing columns added successfully!")
                else:
                    print("All expected columns are present.")
            else:
                print("Users table does not exist.")
                
    except Exception as e:
        print(f"Error verifying database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_database()