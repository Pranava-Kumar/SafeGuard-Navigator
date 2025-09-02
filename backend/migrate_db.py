import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def migrate_database():
    try:
        print(f"Connecting to database: {settings.database_url}")
        
        # Create engine
        engine = create_engine(settings.database_url, echo=True)
        
        # Create a SessionLocal class
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create a new session
        db = SessionLocal()
        
        # Check if 'users' table exists
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';"))
        table_exists = result.fetchone()
        
        if not table_exists:
            print("Users table does not exist. Creating tables...")
            # Import models to ensure they're registered
            from app.db.base import Base
            from app.models.user import User
            from app.models.report import Report
            
            # Create all tables
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully!")
        else:
            print("Users table exists. Checking for missing columns...")
            
            # Check existing columns
            result = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"))
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Add missing columns if they don't exist
            missing_columns = []
            
            if 'date_of_birth' not in existing_columns:
                print("Adding date_of_birth column...")
                db.execute(text("ALTER TABLE users ADD COLUMN date_of_birth TIMESTAMP;"))
                missing_columns.append('date_of_birth')
                
            if 'gender' not in existing_columns:
                print("Adding gender column...")
                db.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR;"))
                missing_columns.append('gender')
                
            if 'avatar' not in existing_columns:
                print("Adding avatar column...")
                db.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR;"))
                missing_columns.append('avatar')
                
            if 'language' not in existing_columns:
                print("Adding language column...")
                db.execute(text("ALTER TABLE users ADD COLUMN language VARCHAR DEFAULT 'ENGLISH';"))
                missing_columns.append('language')
                
            if 'timezone' not in existing_columns:
                print("Adding timezone column...")
                db.execute(text("ALTER TABLE users ADD COLUMN timezone VARCHAR DEFAULT 'Asia/Kolkata';"))
                missing_columns.append('timezone')
                
            if 'city' not in existing_columns:
                print("Adding city column...")
                db.execute(text("ALTER TABLE users ADD COLUMN city VARCHAR;"))
                missing_columns.append('city')
                
            if 'state' not in existing_columns:
                print("Adding state column...")
                db.execute(text("ALTER TABLE users ADD COLUMN state VARCHAR;"))
                missing_columns.append('state')
                
            if 'country' not in existing_columns:
                print("Adding country column...")
                db.execute(text("ALTER TABLE users ADD COLUMN country VARCHAR DEFAULT 'India';"))
                missing_columns.append('country')
                
            if missing_columns:
                print(f"Added missing columns: {', '.join(missing_columns)}")
                db.commit()
            else:
                print("All required columns are present in the users table.")
        
        db.close()
        print("Database migration completed successfully!")
        return True
    except Exception as e:
        print(f"Error during database migration: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    migrate_database()