from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# User-related schemas
class UserType(str, Enum):
    PEDESTRIAN = "pedestrian"
    TWO_WHEELER = "two_wheeler"
    CYCLIST = "cyclist"
    PUBLIC_TRANSPORT = "public_transport"


class TimePreference(str, Enum):
    SAFETY_FIRST = "safety_first"
    BALANCED = "balanced"
    TIME_FIRST = "time_first"


class Language(str, Enum):
    ENGLISH = "en"
    TAMIL = "ta"
    HINDI = "hi"


# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    user_type: UserType = UserType.PEDESTRIAN
    language: Language = Language.ENGLISH


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    data_processing_consent: bool
    consent_version: str = "1.0"

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


# Properties to receive via API on update
class UserUpdate(UserBase):
    pass


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int
    email_verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class User(UserInDBBase):
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    password_hash: str
    data_processing_consent: bool
    consent_version: str
    consent_date: datetime


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Safety score schemas
class SafetyFactor(BaseModel):
    """Represents a single safety factor."""
    score: int = Field(..., ge=0, le=100)  # 0-100 score
    weight: Optional[float] = None  # Weight used in calculation
    description: Optional[str] = None  # Description of the factor


class SafetyFactors(BaseModel):
    """Collection of all safety factors."""
    lighting: SafetyFactor
    footfall: SafetyFactor
    hazards: SafetyFactor
    proximity: SafetyFactor


class SafetyScoreRequest(BaseModel):
    """Request model for calculating safety scores."""
    latitude: float
    longitude: float
    factors: SafetyFactors
    weights: Optional[dict] = None  # Custom weights
    confidence: float = Field(0.5, ge=0, le=1)  # Overall confidence 0-1
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SafetyScoreResponse(BaseModel):
    """Response model for safety score calculation."""
    overall_score: int = Field(..., ge=0, le=100)  # Final 0-100 score
    factors: SafetyFactors
    weights: dict
    confidence: float = Field(..., ge=0, le=1)  # Overall confidence 0-1
    timestamp: datetime


# Route schemas
class Location(BaseModel):
    """Represents a geographic location."""
    latitude: float
    longitude: float


class RouteRequest(BaseModel):
    """Request model for calculating routes."""
    start: Location
    end: Location
    user_type: str = "pedestrian"
    safety_preference: int = Field(50, ge=0, le=100)  # 0-100 scale
    time_of_day: Optional[str] = None
    weather_condition: Optional[str] = None
    avoid_factors: Optional[List[str]] = None


class RouteSegment(BaseModel):
    """Represents a segment of a route."""
    latitude: float
    longitude: float


class Route(BaseModel):
    """Represents a calculated route."""
    id: str
    start: Location
    end: Location
    distance_meters: int
    duration_seconds: int
    safety_score: int = Field(..., ge=0, le=100)
    time_weight: float
    safety_weight: float
    polyline: str  # Encoded polyline
    waypoints: List[RouteSegment]


class SafetyFactorsRoute(BaseModel):
    """Safety factors for route analysis."""
    lighting: dict
    footfall: dict
    hazards: dict
    proximity: dict


class RouteResponse(BaseModel):
    """Response model for route calculation."""
    routes: List[Route]
    safety_analysis: dict  # Overall safety score and factors
    alternatives: dict  # Safest, fastest, balanced routes


# Reputation schemas
class CommunityStanding(str, Enum):
    NEW = "new"
    TRUSTED = "trusted"
    VERIFIED = "verified"
    EXPERT = "expert"


class ReputationUpdateRequest(BaseModel):
    """Request model for updating user reputation."""
    user_id: int
    new_report_verified: bool


class ReputationResponse(BaseModel):
    """Response model for user reputation."""
    user_id: int
    trust_level: float = Field(..., ge=0, le=1)
    positive_reports: int
    total_reports: int
    community_standing: CommunityStanding
    last_calculated_at: datetime


class ReputationCalculationRequest(BaseModel):
    """Request model for calculating Wilson score."""
    positive: int = Field(..., ge=0)
    total: int = Field(..., ge=0)
    z_score: float = Field(1.96, ge=0)  # Default 95% confidence


class WilsonScoreResponse(BaseModel):
    """Response model for Wilson score calculation."""
    wilson_score: float = Field(..., ge=0, le=1)


# Data ingestion schemas
class DataSourceType(str, Enum):
    SATELLITE = "satellite"
    MUNICIPAL = "municipal"
    CROWDSOURCED = "crowdsourced"
    COMMERCIAL = "commercial"
    GOVERNMENT = "government"


class DataSourceCreate(BaseModel):
    """Request model for creating a data source."""
    name: str
    provider: str
    source_type: DataSourceType
    endpoint_url: Optional[str] = None
    api_key_required: bool = False
    reliability_score: Optional[float] = Field(0.8, ge=0, le=1)
    average_response_time: Optional[int] = None  # milliseconds
    uptime_percentage: Optional[float] = Field(99.0, ge=0, le=100)
    rate_limit_requests: Optional[int] = None
    rate_limit_window: Optional[int] = None  # seconds
    geographic_coverage: Optional[str] = None
    update_frequency: Optional[str] = None
    data_types: Optional[List[str]] = None
    status: Optional[str] = "active"


class DataSourceUpdate(BaseModel):
    """Request model for updating a data source."""
    name: Optional[str] = None
    provider: Optional[str] = None
    source_type: Optional[DataSourceType] = None
    endpoint_url: Optional[str] = None
    api_key_required: Optional[bool] = None
    reliability_score: Optional[float] = Field(None, ge=0, le=1)
    average_response_time: Optional[int] = None
    uptime_percentage: Optional[float] = Field(None, ge=0, le=100)
    rate_limit_requests: Optional[int] = None
    rate_limit_window: Optional[int] = None
    geographic_coverage: Optional[str] = None
    update_frequency: Optional[str] = None
    data_types: Optional[List[str]] = None
    status: Optional[str] = None


class DataSourceResponse(BaseModel):
    """Response model for data source information."""
    id: int
    name: str
    provider: str
    source_type: DataSourceType
    endpoint_url: Optional[str] = None
    api_key_required: bool
    reliability_score: float
    average_response_time: Optional[int] = None
    uptime_percentage: float
    rate_limit_requests: Optional[int] = None
    rate_limit_window: Optional[int] = None
    geographic_coverage: Optional[str] = None
    update_frequency: Optional[str] = None
    data_types: List[str]
    status: str
    last_sync_at: Optional[datetime] = None
    next_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DataIngestionRequest(BaseModel):
    """Request model for data ingestion."""
    source_name: str
    data_types: List[str]
    region: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    force_refresh: bool = False


class DataIngestionResponse(BaseModel):
    """Response model for data ingestion."""
    success: bool
    message: str
    records_processed: int
    source_name: str
    timestamp: datetime


# Emergency schemas
class EmergencyType(str, Enum):
    MEDICAL = "medical"
    POLICE = "police"
    FIRE = "fire"
    WOMEN_SAFETY = "women_safety"
    ACCIDENT = "accident"
    NATURAL_DISASTER = "natural_disaster"


class EmergencyAlertRequest(BaseModel):
    """Request model for triggering an emergency alert."""
    location: Location
    emergency_type: EmergencyType
    description: Optional[str] = None
    severity: int = Field(3, ge=1, le=5)
    anonymous: bool = False


class EmergencyAlertResponse(BaseModel):
    """Response model for emergency alert."""
    alert_id: str
    user_id: Optional[int] = None
    location: Location
    emergency_type: EmergencyType
    severity: int
    status: str
    timestamp: datetime
    estimated_response_time: Optional[int] = None
    message: str


class EmergencyServicesResponse(BaseModel):
    """Response model for emergency services information."""
    police_stations: List[Dict[str, Any]]
    hospitals: List[Dict[str, Any]]
    fire_stations: List[Dict[str, Any]]
    women_helplines: List[Dict[str, Any]]
    timestamp: datetime