from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def get_user_by_email(db: Session, *, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, *, obj_in: UserCreate) -> User:
    db_obj = User(
        email=obj_in.email,
        password_hash=get_password_hash(obj_in.password),
        first_name=obj_in.firstName,
        last_name=obj_in.lastName,
        display_name=obj_in.displayName,
        phone=obj_in.phone,
        avatar=obj_in.avatar,
        user_type=obj_in.userType,
        role=obj_in.role,
        email_verified=obj_in.emailVerified,
        language=obj_in.language,
        city=obj_in.city,
        state=obj_in.state,
        country=obj_in.country,
        subscription_plan=obj_in.subscriptionPlan,
        subscription_status=obj_in.subscriptionStatus,
        data_processing_consent=obj_in.dataProcessingConsent,
        consent_date=obj_in.consentDate,
        consent_version=obj_in.consentVersion,
        location_sharing_level=obj_in.locationSharingLevel,
        crowdsourcing_participation=obj_in.crowdsourcingParticipation,
        personalized_recommendations=obj_in.personalizedRecommendations,
        analytics_concent=obj_in.analyticsConcent,
        marketing_concent=obj_in.marketingConcent,
        risk_tolerance=int(obj_in.riskTolerance) if obj_in.riskTolerance else 50,
        time_preference=obj_in.timePreference,
        last_login_at=obj_in.lastLoginAt,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def authenticate(
    db: Session, *, email: str, password: str
) -> Optional[User]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, str(user.password_hash)):
        return None
    return user
