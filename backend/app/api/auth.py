from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.schemas import UserCreate, UserLogin, User, Token
from app.models import User as UserModel
from app.core.security import get_password_hash, create_access_token, verify_password
from datetime import timedelta
from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
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
    
    return db_user


@router.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not db_user or not verify_password(user.password, str(db_user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=db_user.email, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/simple-register", response_model=dict)
def simple_register(user: UserCreate, db: Session = Depends(get_db)):
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


@router.post("/simple-login", response_model=dict)
def simple_login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not db_user or not verify_password(user.password, str(db_user.password_hash)):
        # Instead of raising an error, we'll create a guest user
        return {"success": False, "message": "Incorrect email or password"}
    
    return {"success": True, "message": "Login successful", "user": db_user}


@router.get("/me", response_model=dict)
def get_current_user(db: Session = Depends(get_db)):
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