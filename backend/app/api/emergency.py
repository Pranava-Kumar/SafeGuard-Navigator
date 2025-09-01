from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.schemas import (
    EmergencyAlertRequest,
    EmergencyAlertResponse,
    EmergencyServicesResponse,
    Location
)
from app.models import EmergencyAlert as DBEmergencyAlert
from typing import List
import uuid
from datetime import datetime
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simulated emergency services (in a real implementation, these would come from actual data sources)
EMERGENCY_SERVICES = {
    "police_stations": [
        {
            "id": "ps001",
            "name": "Central Police Station",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "address": "MG Road, Bangalore",
            "phone": "080-25591234",
            "distance_meters": 500
        }
    ],
    "hospitals": [
        {
            "id": "h001",
            "name": "City General Hospital",
            "latitude": 12.9756,
            "longitude": 77.5906,
            "address": "Near Railway Station, Bangalore",
            "phone": "080-25501234",
            "distance_meters": 800,
            "specialties": ["emergency", "trauma", "cardiology"]
        }
    ],
    "fire_stations": [
        {
            "id": "fs001",
            "name": "Central Fire Station",
            "latitude": 12.9736,
            "longitude": 77.5926,
            "address": "Commercial Street, Bangalore",
            "phone": "080-25511234",
            "distance_meters": 600
        }
    ],
    "women_helplines": [
        {
            "number": "1091",
            "name": "Women Helpline",
            "description": "National Women Helpline"
        },
        {
            "number": "181",
            "name": "Women Helpline",
            "description": "State Women Helpline"
        }
    ]
}

@router.post("/trigger", response_model=EmergencyAlertResponse, status_code=status.HTTP_201_CREATED)
def trigger_emergency_alert(request: EmergencyAlertRequest, db: Session = Depends(get_db)):
    """
    Trigger an emergency alert with sub-3-second activation.
    
    This endpoint simulates the emergency alert system with the following features:
    - Sub-3-second emergency activation
    - Location-based emergency services identification
    - Emergency contact notification
    - 112 emergency service integration
    """
    try:
        logger.info(f"Emergency alert triggered: {request.emergency_type} at {request.location.latitude}, {request.location.longitude}")
        
        # Generate unique alert ID
        alert_id = str(uuid.uuid4())
        
        # In a real implementation, this would:
        # 1. Immediately send the alert to 112 emergency services
        # 2. Identify nearest emergency services
        # 3. Notify emergency contacts
        # 4. Update safety maps
        # 5. Log the emergency event
        
        # For simulation, we'll just create a database entry
        db_alert = DBEmergencyAlert(
            id=alert_id,
            user_id=None,  # Would come from authenticated user in real implementation
            latitude=request.location.latitude,
            longitude=request.location.longitude,
            emergency_type=request.emergency_type.value,
            description=request.description,
            severity=request.severity,
            anonymous=request.anonymous,
            status="active",
            timestamp=datetime.utcnow()
        )
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        # Simulate emergency services response time
        import time
        time.sleep(1)  # Simulate sub-3-second processing
        
        # Return response
        return EmergencyAlertResponse(
            alert_id=alert_id,
            user_id=None,
            location=request.location,
            emergency_type=request.emergency_type,
            severity=request.severity,
            status="active",
            timestamp=datetime.utcnow(),
            estimated_response_time=300,  # 5 minutes estimated response
            message=f"Emergency alert {alert_id} has been triggered and sent to emergency services."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error triggering emergency alert: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering emergency alert: {str(e)}"
        )

@router.get("/services", response_model=EmergencyServicesResponse)
def get_emergency_services(location: Location, db: Session = Depends(get_db)):
    """
    Get emergency services near a specific location.
    
    This endpoint returns information about nearby emergency services including:
    - Police stations
    - Hospitals
    - Fire stations
    - Women's helpline numbers
    """
    try:
        logger.info(f"Fetching emergency services for location: {location.latitude}, {location.longitude}")
        
        # In a real implementation, this would:
        # 1. Query the database for nearby emergency services
        # 2. Calculate distances to the provided location
        # 3. Sort by proximity
        
        # For simulation, we'll return the predefined services with simulated distances
        services = EMERGENCY_SERVICES.copy()
        
        # Add distance calculations (simplified for simulation)
        for service_type in ["police_stations", "hospitals", "fire_stations"]:
            for service in services[service_type]:
                # In a real implementation, this would calculate actual distance
                # For simulation, we'll just use a fixed value
                service["distance_meters"] = 500  # Simulated distance
                
        return EmergencyServicesResponse(
            police_stations=services["police_stations"],
            hospitals=services["hospitals"],
            fire_stations=services["fire_stations"],
            women_helplines=services["women_helplines"],
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error fetching emergency services: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching emergency services: {str(e)}"
        )

@router.get("/status/{alert_id}", response_model=EmergencyAlertResponse)
def get_emergency_status(alert_id: str, db: Session = Depends(get_db)):
    """
    Get the status of a specific emergency alert.
    """
    try:
        db_alert = db.query(DBEmergencyAlert).filter(DBEmergencyAlert.id == alert_id).first()
        if not db_alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency alert not found"
            )
            
        return EmergencyAlertResponse(
            alert_id=db_alert.id,
            user_id=db_alert.user_id,
            location=Location(latitude=db_alert.latitude, longitude=db_alert.longitude),
            emergency_type=db_alert.emergency_type,
            severity=db_alert.severity,
            status=db_alert.status,
            timestamp=db_alert.timestamp,
            estimated_response_time=db_alert.estimated_response_time,
            message=f"Emergency alert is currently {db_alert.status}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching emergency status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching emergency status: {str(e)}"
        )

@router.post("/safe-confirmation/{alert_id}")
def confirm_safe_status(alert_id: str, db: Session = Depends(get_db)):
    """
    Confirm that the user is safe after an emergency alert.
    """
    try:
        db_alert = db.query(DBEmergencyAlert).filter(DBEmergencyAlert.id == alert_id).first()
        if not db_alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency alert not found"
            )
            
        # Update alert status to resolved
        db_alert.status = "resolved"
        db_alert.resolved_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": f"Emergency alert {alert_id} marked as resolved. Help is on the way if needed.",
            "alert_id": alert_id,
            "status": "resolved"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error confirming safe status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error confirming safe status: {str(e)}"
        )

@router.post("/112-integration")
def integrate_with_112_services(alert_data: dict, db: Session = Depends(get_db)):
    """
    Integrate with India's 112 emergency services.
    
    This endpoint simulates integration with India's unified emergency number system.
    In a real implementation, this would connect to the actual 112 services API.
    """
    try:
        logger.info(f"Initiating 112 integration for alert: {alert_data}")
        
        # In a real implementation, this would:
        # 1. Connect to the 112 services API
        # 2. Send alert details including location, type, and severity
        # 3. Receive confirmation and tracking information
        
        # For simulation, we'll just log and return a mock response
        import time
        time.sleep(1)  # Simulate API call delay
        
        return {
            "success": True,
            "message": "Successfully integrated with 112 emergency services",
            "request_id": str(uuid.uuid4()),
            "tracking_url": "https://112india.gov.in/tracking/mock123",
            "estimated_dispatch": 300,  # 5 minutes
            "services_notified": ["police", "ambulance"]
        }
    except Exception as e:
        logger.error(f"Error integrating with 112 services: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error integrating with 112 services: {str(e)}"
        )