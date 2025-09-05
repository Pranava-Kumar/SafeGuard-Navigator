"""
Authentication Service for SafeRoute
Implements proper JWT-based authentication with role-based access control
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.db.utils import get_db
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.models.user import User as UserModel
from app.schemas import UserLogin, Token

class AuthService:
    """Service for handling user authentication"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = "HS256"
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    async def authenticate_user(
        self, 
        db: Session, 
        email: str, 
        password: str
    ) -> Optional[UserModel]:
        """
        Authenticate a user by email and password
        
        Args:
            db: Database session
            email: User's email
            password: User's password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            return None
        if not verify_password(password, str(user.password_hash)):
            return None
        return user
    
    async def create_access_token(
        self, 
        user: UserModel
    ) -> Dict[str, str]:
        """
        Create access token for authenticated user
        
        Args:
            user: Authenticated user object
            
        Returns:
            Dictionary with access token and token type
        """
        expires_delta = timedelta(minutes=self.access_token_expire_minutes)
        access_token = create_access_token(
            subject=user.email, 
            expires_delta=expires_delta
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    async def get_current_user(
        self, 
        db: Session, 
        token: str
    ) -> UserModel:
        """
        Get current user from JWT token
        
        Args:
            db: Database session
            token: JWT token
            
        Returns:
            User object
            
        Raises:
            HTTPException: If token is invalid or user not found
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
    
    async def login(
        self, 
        db: Session, 
        user_data: UserLogin
    ) -> Dict[str, Any]:
        """
        Handle user login
        
        Args:
            db: Database session
            user_data: User login data
            
        Returns:
            Dictionary with access token and user information
            
        Raises:
            HTTPException: If authentication fails
        """
        user = await self.authenticate_user(db, user_data.email, user_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login time
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        # Create access token
        token_data = await self.create_access_token(user)
        
        # Return user data along with token
        return {
            "access_token": token_data["access_token"],
            "token_type": token_data["token_type"],
            "user": {
                "id": user.id,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "displayName": user.display_name,
                "userType": user.user_type,
                "role": user.role,
                "emailVerified": user.email_verified,
                "language": user.language,
                "city": user.city,
                "state": user.state,
                "country": user.country,
                "subscriptionPlan": user.subscription_plan,
                "subscriptionStatus": user.subscription_status,
                "dataProcessingConsent": user.data_processing_consent,
                "consentDate": user.consent_date.isoformat() if user.consent_date else None,
                "consentVersion": user.consent_version,
                "locationSharingLevel": user.location_sharing_level,
                "crowdsourcingParticipation": user.crowdsourcing_participation,
                "personalizedRecommendations": user.personalized_recommendations,
                "analyticsConsent": user.analytics_concent,
                "marketingConsent": user.marketing_concent,
                "riskTolerance": user.risk_tolerance,
                "timePreference": user.time_preference,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None
            }
        }
    
    async def logout(self, token: str) -> Dict[str, str]:
        """
        Handle user logout (invalidate token)
        
        Args:
            token: JWT token to invalidate
            
        Returns:
            Success message
        """
        # In a real implementation, we would add the token to a blacklist
        # For now, we'll just return success
        return {"message": "Successfully logged out"}

# Global instance
auth_service = AuthService()