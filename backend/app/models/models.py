from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Float, JSON
from sqlalchemy.sql import func
from app.db.base import Base
from enum import Enum as PyEnum
from typing import Optional
from datetime import datetime


# User-related enums
class UserType(str, PyEnum):
    PEDESTRIAN = "pedestrian"
    TWO_WHEELER = "two_wheeler"
    CYCLIST = "cyclist"
    PUBLIC_TRANSPORT = "public_transport"


class TimePreference(str, PyEnum):
    SAFETY_FIRST = "safety_first"
    BALANCED = "balanced"
    TIME_FIRST = "time_first"


class CommunityStanding(str, PyEnum):
    NEW = "new"
    TRUSTED = "trusted"
    VERIFIED = "verified"
    EXPERT = "expert"


class Language(str, PyEnum):
    ENGLISH = "en"
    TAMIL = "ta"
    HINDI = "hi"


# Data source enums
class DataSourceType(str, PyEnum):
    SATELLITE = "satellite"
    MUNICIPAL = "municipal"
    CROWDSOURCED = "crowdsourced"
    COMMERCIAL = "commercial"
    GOVERNMENT = "government"


# User model
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
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Data source model
class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    provider = Column(String, nullable=False)
    source_type = Column(Enum(DataSourceType), nullable=False)
    
    # Configuration
    endpoint_url = Column(String, nullable=True)
    api_key_required = Column(Boolean, default=False)
    
    # Reliability & Performance
    reliability_score = Column(Float, default=0.8)  # 0-1
    average_response_time = Column(Integer, nullable=True)  # milliseconds
    uptime_percentage = Column(Float, default=99.0)
    
    # Rate Limiting
    rate_limit_requests = Column(Integer, nullable=True)
    rate_limit_window = Column(Integer, nullable=True)  # seconds
    
    # Coverage & Freshness
    geographic_coverage = Column(String, nullable=True)
    update_frequency = Column(String, nullable=True)
    data_types = Column(String, nullable=True)
    
    # Status
    status = Column(String, default="active")
    last_sync_at = Column(DateTime, nullable=True)
    next_sync_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Safety score model
class SafetyScore(Base):
    __tablename__ = "safety_scores"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geohash = Column(String, nullable=False)
    
    # Scores
    overall_score = Column(Integer, nullable=False)  # 0-100
    confidence = Column(Float, default=0.5)  # 0-1
    
    # Multi-factor Components
    lighting_score = Column(Integer, default=50)  # 0-100
    footfall_score = Column(Integer, default=50)  # 0-100
    hazard_score = Column(Integer, default=50)  # 0-100
    proximity_score = Column(Integer, default=50)  # 0-100
    
    # Context
    time_of_day = Column(String, nullable=True)
    weather_condition = Column(String, nullable=True)
    user_type = Column(String, nullable=True)
    
    # Data Attribution
    data_sources = Column(JSON, nullable=True)
    factors = Column(JSON, nullable=True)
    ai_predictions = Column(JSON, nullable=True)
    
    # Temporal
    timestamp = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Route model
class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    
    # Route Geometry
    start_latitude = Column(Float, nullable=False)
    start_longitude = Column(Float, nullable=False)
    end_latitude = Column(Float, nullable=False)
    end_longitude = Column(Float, nullable=False)
    
    start_address = Column(String, nullable=True)
    end_address = Column(String, nullable=True)
    
    # Route Metrics
    distance_meters = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    overall_safety_score = Column(Integer, nullable=False)  # 0-100
    
    # Route Options
    route_type = Column(String, nullable=True)
    optimization_preference = Column(String, nullable=True)
    
    # Context
    calculated_at = Column(DateTime, default=func.now())
    context = Column(JSON, nullable=True)
    
    # Usage
    used_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    user_rating = Column(Integer, nullable=True)  # 1-5 scale
    user_feedback = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# User reputation model
class UserReputation(Base):
    __tablename__ = "user_reputation"

    user_id = Column(Integer, primary_key=True, index=True)
    
    # Wilson Score Components
    trust_level = Column(Float, default=0.5000)  # 0-1 Wilson score
    positive_reports = Column(Integer, default=0)
    total_reports = Column(Integer, default=0)
    
    # Community Standing
    community_standing = Column(Enum(CommunityStanding), default=CommunityStanding.NEW)
    achievements = Column(String, nullable=True)
    badges = Column(String, nullable=True)
    
    # Moderation
    reports_submitted = Column(Integer, default=0)
    reports_verified = Column(Integer, default=0)
    reports_rejected = Column(Integer, default=0)
    moderation_actions = Column(Integer, default=0)
    
    # Temporal
    last_calculated_at = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Emergency alert model
class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    
    # Emergency Details
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    severity = Column(Integer, nullable=False)  # 1-5 scale
    
    # Status
    status = Column(String, default="active")
    anonymous = Column(Boolean, default=False)
    
    # Response Tracking
    estimated_response_time = Column(Integer, nullable=True)  # seconds
    response_details = Column(JSON, nullable=True)
    
    # Temporal
    timestamp = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}