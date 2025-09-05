from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime
from app.models.models import UserType, Language, TimePreference, UserRole  # Import enums from models.py


# User model that matches the actual database schema
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    
    # Profile
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    avatar = Column(String, nullable=True)  # Changed from avatar_url to avatar to match DB
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    language = Column(Enum(Language), default=Language.ENGLISH)
    timezone = Column(String, default="Asia/Kolkata")
    
    # Location
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, default="India")
    
    # Authentication
    email_verified = Column(Boolean, default=False)
    # REMOVED: email_verified_at column as it doesn't exist in the database
    # REMOVED: two_factor_enabled column as it doesn't exist in the database
    # REMOVED: two_factor_secret column as it doesn't exist in the database
    # REMOVED: backup_codes column as it doesn't exist in the database
    # REMOVED: last_password_change column as it doesn't exist in the database
    # REMOVED: login_attempts column as it doesn't exist in the database
    # REMOVED: locked_until column as it doesn't exist in the database
    
    # DPDP Compliance
    data_processing_consent = Column(Boolean, default=False)
    consent_version = Column(String, default="1.0")
    consent_date = Column(DateTime, nullable=True)
    data_retention_expiry = Column(DateTime, nullable=True)
    
    # SafeRoute Profile
    user_type = Column(Enum(UserType), default=UserType.PEDESTRIAN)
    risk_tolerance = Column(Integer, default=50)  # 0-100
    time_preference = Column(Enum(TimePreference), default=TimePreference.SAFETY_FIRST)
    
    # Additional fields from the schema
    role = Column(Enum(UserRole), default=UserRole.USER)
    subscription_plan = Column(String, default="free")
    subscription_status = Column(String, default="active")
    location_sharing_level = Column(String, default="coarse")
    crowdsourcing_participation = Column(Boolean, default=True)
    personalized_recommendations = Column(Boolean, default=True)
    analytics_consent = Column(Boolean, default=False)
    marketing_concent = Column(Boolean, default=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)