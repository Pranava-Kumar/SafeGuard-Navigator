from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    PREMIUM = "premium"
    TRUSTED_REPORTER = "trusted_reporter"
    CIVIC_PARTNER = "civic_partner"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    display_name = Column(String, index=True)
    phone = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    user_type = Column(String, default="pedestrian")  # pedestrian, two_wheeler, cyclist, public_transport
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER)
    email_verified = Column(Boolean, default=False)
    language = Column(String, default="en")  # en, ta, hi
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, default="India")
    subscription_plan = Column(String, default="free")  # free, premium, enterprise
    subscription_status = Column(String, default="active")  # active, cancelled, expired, trial
    data_processing_consent = Column(Boolean, default=False)
    consent_date = Column(DateTime, nullable=True)
    consent_version = Column(String, default="1.0")
    location_sharing_level = Column(String, default="coarse")  # precise, coarse, city_only
    crowdsourcing_participation = Column(Boolean, default=True)
    personalized_recommendations = Column(Boolean, default=True)
    analytics_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    risk_tolerance = Column(Integer, default=50)  # 0-100
    time_preference = Column(String, default="safety_first")  # safety_first, balanced, time_first
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    data_retention_expiry = Column(DateTime, nullable=True)