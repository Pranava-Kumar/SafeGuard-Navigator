
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    is_active: Optional[bool] = True
    displayName: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    userType: Optional[str] = "pedestrian"
    role: Optional[str] = "user"
    emailVerified: Optional[bool] = False
    language: Optional[str] = "en"
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    subscriptionPlan: Optional[str] = "free"
    subscriptionStatus: Optional[str] = "active"
    dataProcessingConsent: Optional[bool] = False
    consentDate: Optional[datetime] = None
    consentVersion: Optional[str] = "1.0"
    locationSharingLevel: Optional[str] = "coarse"
    crowdsourcingParticipation: Optional[bool] = True
    personalizedRecommendations: Optional[bool] = True
    analyticsConcent: Optional[bool] = False
    marketingConcent: Optional[bool] = False
    riskTolerance: Optional[str] = "50"
    timePreference: Optional[str] = "safety_first"
    lastLoginAt: Optional[datetime] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    loginAttempts: Optional[str] = "0"
    lockedUntil: Optional[datetime] = None
    dataRetentionExpiry: Optional[datetime] = None

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None
    updatedAt: Optional[datetime] = None
    loginAttempts: Optional[str] = None
    lockedUntil: Optional[datetime] = None
    dataRetentionExpiry: Optional[datetime] = None

class UserInDBBase(UserBase):
    id: str
    role: str
    createdAt: datetime
    updatedAt: datetime
    loginAttempts: str
    lockedUntil: Optional[datetime] = None
    dataRetentionExpiry: Optional[datetime] = None

    class Config:
        orm_mode = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    password: str
