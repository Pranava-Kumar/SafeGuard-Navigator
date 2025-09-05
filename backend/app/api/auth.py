from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.utils import get_db
from app.schemas import UserCreate, UserLogin, User, Token
from app.models import User as UserModel
from app.core.security import get_password_hash, verify_password
from app.services.auth_service import auth_service
from datetime import timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create user object with fields that match the database schema
        db_user = UserModel(
            email=user.email,
            password_hash=hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            city=user.city,
            state=user.state,
            user_type=user.user_type,
            language=user.language,
            data_processing_consent=user.data_processing_consent,
            consent_version=user.consent_version
        )
        
        # Add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token for the new user
        token_data = await auth_service.create_access_token(db_user)
        
        return {
            "access_token": token_data["access_token"],
            "token_type": token_data["token_type"],
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "firstName": db_user.first_name,
                "lastName": db_user.last_name,
                "displayName": db_user.display_name,
                "userType": db_user.user_type,
                "role": db_user.role,
                "emailVerified": db_user.email_verified,
                "language": db_user.language,
                "city": db_user.city,
                "state": db_user.state,
                "country": db_user.country,
                "subscriptionPlan": db_user.subscription_plan,
                "subscriptionStatus": db_user.subscription_status,
                "dataProcessingConsent": db_user.data_processing_consent,
                "consentDate": db_user.consent_date.isoformat() if db_user.consent_date else None,
                "consentVersion": db_user.consent_version,
                "locationSharingLevel": db_user.location_sharing_level,
                "crowdsourcingParticipation": db_user.crowdsourcing_participation,
                "personalizedRecommendations": db_user.personalized_recommendations,
                "analyticsConsent": db_user.analytics_consent,
                "marketingConsent": db_user.marketing_concent,
                "riskTolerance": db_user.risk_tolerance,
                "timePreference": db_user.time_preference,
                "createdAt": db_user.created_at.isoformat() if db_user.created_at else None,
                "updatedAt": db_user.updated_at.isoformat() if db_user.updated_at else None
            }
        }
    except HTTPException:
        raise
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input data: {str(e)}"
        )
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User already exists or data integrity error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        # Log the detailed error for debugging
        logger.error(f"Unexpected error during user registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )


@router.post("/login", response_model=dict)
async def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    try:
        result = await auth_service.login(db, user)
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input data: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the detailed error for debugging
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )


@router.post("/logout", response_model=dict)
async def logout_user(token: str, db: Session = Depends(get_db)):
    """Logout user"""
    try:
        result = await auth_service.logout(token)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input data: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the detailed error for debugging
        logger.error(f"Unexpected error during logout: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during logout"
        )


@router.post("/simple-register", response_model=dict)
async def simple_register(user: UserCreate, db: Session = Depends(get_db)):
    """Simple registration endpoint"""
    try:
        # Check if user already exists
        db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if db_user:
            return {"success": True, "message": "User already exists", "user": db_user}
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create user object with fields that match the database schema
        db_user = UserModel(
            email=user.email,
            password_hash=hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            city=user.city,
            state=user.state,
            user_type=user.user_type,
            language=user.language,
            data_processing_consent=user.data_processing_consent,
            consent_version=user.consent_version
        )
        
        # Add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"success": True, "message": "Registration successful", "user": db_user}
    except ValueError as e:
        db.rollback()
        logger.error(f"Value error during simple registration: {str(e)}")
        return {"success": False, "message": f"Invalid input data: {str(e)}"}
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error during simple registration: {str(e)}")
        return {"success": False, "message": "User already exists or data integrity error"}
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during simple registration: {str(e)}", exc_info=True)
        return {"success": False, "message": "An unexpected error occurred during registration"}


@router.post("/simple-login", response_model=dict)
async def simple_login(user: UserLogin, db: Session = Depends(get_db)):
    """Simple login endpoint"""
    try:
        # Find user by email
        db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if not db_user or not verify_password(user.password, str(db_user.password_hash)):
            # Instead of raising an error, we'll create a guest user
            return {"success": False, "message": "Incorrect email or password"}
        
        return {"success": True, "message": "Login successful", "user": db_user}
    except ValueError as e:
        logger.error(f"Value error during simple login: {str(e)}")
        return {"success": False, "message": f"Invalid input data: {str(e)}"}
    except Exception as e:
        logger.error(f"Unexpected error during simple login: {str(e)}", exc_info=True)
        return {"success": False, "message": "An unexpected error occurred during login"}


@router.get("/me", response_model=dict)
async def get_current_user(db: Session = Depends(get_db)):
    """Get current authenticated user"""
    try:
        # For now, return a mock user to bypass authentication
        mock_user = {
            "id": "mock-user-id",
            "email": "guest@example.com",
            "firstName": "Guest",
            "lastName": "User",
            "displayName": "Guest User",
            "userType": "pedestrian",
            "role": "user",
            "emailVerified": True,
            "language": "en",
            "country": "India",
            "subscriptionPlan": "free",
            "subscriptionStatus": "active",
            "dataProcessingConsent": True,
            "consentDate": "2025-01-01T00:00:00Z",
            "consentVersion": "1.0",
            "locationSharingLevel": "city_only",
            "crowdsourcingParticipation": True,
            "personalizedRecommendations": True,
            "analyticsConsent": False,
            "marketingConsent": False,
            "riskTolerance": 50,
            "timePreference": "balanced",
            "createdAt": "2025-01-01T00:00:00Z",
            "updatedAt": "2025-01-01T00:00:00Z"
        }
        return {"success": True, "user": mock_user}
    except ValueError as e:
        # For now, return a mock user to bypass authentication
        mock_user = {
            "id": "mock-user-id",
            "email": "guest@example.com",
            "firstName": "Guest",
            "lastName": "User",
            "displayName": "Guest User",
            "userType": "pedestrian",
            "role": "user",
            "emailVerified": True,
            "language": "en",
            "country": "India",
            "subscriptionPlan": "free",
            "subscriptionStatus": "active",
            "dataProcessingConsent": True,
            "consentDate": "2025-01-01T00:00:00Z",
            "consentVersion": "1.0",
            "locationSharingLevel": "city_only",
            "crowdsourcingParticipation": True,
            "personalizedRecommendations": True,
            "analyticsConsent": False,
            "marketingConsent": False,
            "riskTolerance": 50,
            "timePreference": "balanced",
            "createdAt": "2025-01-01T00:00:00Z",
            "updatedAt": "2025-01-01T00:00:00Z"
        }
        return {"success": True, "user": mock_user}